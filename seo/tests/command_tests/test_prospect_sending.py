from datetime import datetime, timezone as dt_timezone
from io import StringIO
from zoneinfo import ZoneInfo

import pytest
from django.core.management import call_command
from freetheplatform.messaging import Message, Suppression, suppress

from affiliates.management.commands import send_affiliate_outreach as command
from seo.models import SeoProspect
from seo.tests.factories import PDF, SeoProspectFactory
from seo.utils.prospect_sending import UNSUBSCRIBE_LINE, body_for, subject_for

pytestmark = pytest.mark.django_db

PERTH = ZoneInfo("Australia/Perth")


def perth(day, hour):
    """A fixed instant: 2026-10-26 is a Monday."""
    return datetime(2026, 10, day, hour, 30, tzinfo=PERTH).astimezone(dt_timezone.utc)


def run(monkeypatch, now, *args, sleeps=None):
    monkeypatch.setattr(command.timezone, "now", lambda: now)
    monkeypatch.setattr(command.time, "sleep", lambda seconds: (sleeps if sleeps is not None else []).append(seconds))
    out = StringIO()
    call_command("send_affiliate_outreach", *args, stdout=out, stderr=out)
    return out.getvalue()


def test_the_hourly_run_emails_a_queued_report_with_its_pdf(outbox, monkeypatch):
    prospect = SeoProspectFactory(subject_version=3, paid_searches=["plumber perth"])
    now = perth(26, 10)

    output = run(monkeypatch, now)

    assert "1 report email(s) sent." in output
    [message] = outbox
    assert message.to == prospect.email
    assert message.message_type == "seo_prospect.3"
    assert message.subject == "Your 'plumber perth' ad, and what your site is missing"
    assert message.body_html == ""
    assert UNSUBSCRIBE_LINE in message.body_text
    assert message.body_text == body_for(prospect).rstrip()
    assert message.attachments == [{"name": f"{prospect.slug}_seo_report_r1.pdf", "size": len(PDF)}]
    prospect.refresh_from_db()
    assert prospect.sent_at == now
    assert Message.objects.get().content_object == prospect

    # Sent once: the next run finds nothing.
    run(monkeypatch, now)
    assert len(outbox) == 1


def test_body_one_says_why_the_business_was_picked_and_what_stands_out():
    """The report email is composed from the row: the ad the sweep saw, the count, the two strongest titles."""
    prospect = SeoProspectFactory(
        business="Rebus Legal", contact_name="Jasdev Singh", recommendation_count=9,
        paid_searches=["family lawyer perth", "traffic lawyer perth"],
        issues=["Make the Google listing say family law", "Put the fixed fees on the family page", "A third"],
    )

    body = body_for(prospect)

    assert body.startswith(
        "Hi Jasdev,\n\nI picked Rebus Legal because you're paying for ads on searches your website performs "
        "poorly on. Google showed your ad for 'family lawyer perth', and without it Rebus Legal was nowhere on "
        "that search: not in the map box, not in the first page of free results. The same was true for "
        "'traffic lawyer perth'.\n\nSo I wrote you a report. Attached: 9 recommendations, from what anyone can "
        "see of your site, your Google listing and the search results. Two stand out: make the Google listing "
        "say family law, and put the fixed fees on the family page.\n\n"
    )
    assert "A third" not in body
    assert body.count("no thanks") == 1
    assert body.rstrip().endswith("www.freethedesk.com.au/seo")


def test_body_one_with_no_paid_search_speaks_of_the_site_alone():
    prospect = SeoProspectFactory(business="Peach Business", paid_searches=[], issues=["Only one"])
    body = body_for(prospect)
    assert "I picked Peach Business because your website should be doing more for you" in body
    assert "ad for" not in body
    assert "One stands out: only one." in body


def test_body_two_goes_as_the_owner_wrote_it_with_the_name_and_the_metric(outbox, monkeypatch):
    """The second body is the server's fixed text: only the greeting and what the business counts change."""
    prospect = SeoProspectFactory(body_version=2, contact_name="Craig Smith", metric="calls")

    run(monkeypatch, perth(26, 10))

    [message] = outbox
    assert message.to == prospect.email
    assert message.body_text.startswith("Hi Craig,\n\nI spent three hours writing the attached website report.")
    assert "if your calls don't move in a month, mark this email as spam" in message.body_text
    assert UNSUBSCRIBE_LINE not in message.body_text
    assert message.attachments == [{"name": f"{prospect.slug}_seo_report_r1.pdf", "size": len(PDF)}]


def test_the_affiliate_body_offers_the_program_at_the_live_figures():
    """A podcast host gets the same report and the affiliate offer in place of the paid one; the figures are the
    site settings' on the day, as the podcast pitch's are."""
    prospect = SeoProspectFactory(
        purpose="affiliate", body_version=3, business="Money Secrets", domain="peachbm.com.au",
        contact_name="Fi Johnston", recommendation_count=8, paid_searches=[],
        issues=["Name the city on the home page", "Put the podcast on its own page"],
    )

    body = body_for(prospect)

    assert body.startswith("Hi Fi,\n\nI picked Money Secrets because your listeners are the people we write for")
    assert "Attached: 8 recommendations, from what anyone can see of peachbm.com.au" in body
    assert "Two stand out: name the city on the home page, and put the podcast on its own page." in body
    assert "Your listeners get 20% off an SEO audit with your code, and you get half of every audit they buy: " \
           "$220 to $560 an audit" in body
    assert "the one customers pay $850 for, is written for you free" in body
    assert "www.freethedesk.com.au/affiliates" in body
    assert "three hours" not in body


def test_outside_the_window_no_report_is_sent(outbox, monkeypatch):
    SeoProspectFactory()
    assert "Outside the sending window" in run(monkeypatch, perth(24, 10))
    assert outbox == []
    assert SeoProspect.objects.get().sent_at is None


def test_excluded_and_suppressed_prospects_wait(outbox, monkeypatch):
    SeoProspectFactory(excluded_reason="Called them first.")
    gone = SeoProspectFactory()
    suppress(gone.email, reason=Suppression.Reason.OPTED_OUT)
    keep = SeoProspectFactory()

    run(monkeypatch, perth(26, 10))

    assert [m.to for m in outbox] == [keep.email]


def test_a_row_from_before_the_server_composed_the_email_keeps_the_analysts_words(outbox, monkeypatch):
    """Until 2026-10-30 body 1 was the analyst's email, stored on the row; it still goes, and shows, as written."""
    SeoProspectFactory(body="Hi there,\n\nReply 'no thanks' if you'd rather I didn't.\n\nEthan Betts")
    SeoProspectFactory(body="Hi there,\n\nThe analyst's words.\n\nEthan Betts")
    run(monkeypatch, perth(26, 10))
    assert outbox[0].body_text.count("no thanks") == 1
    assert outbox[1].body_text == f"Hi there,\n\nThe analyst's words.\n\nEthan Betts\n\n{UNSUBSCRIBE_LINE}"


def test_reports_go_ten_seconds_apart_and_after_the_pitches(outbox, monkeypatch):
    SeoProspectFactory()
    SeoProspectFactory()
    sleeps = []

    output = run(monkeypatch, perth(26, 10), "--reports", "5", sleeps=sleeps)

    assert "2 report email(s) sent." in output
    assert sleeps == [command.PAUSE_SECONDS]


@pytest.mark.parametrize("version, expected", [
    (1, "I spent 3 hours on this. I am not a bot."),
    (2, "10 free fixes for business0.com.au"),
    (4, "A free SEO report for Business 0"),
    (5, "Business 0 isn't on Google's first page for 'plumber perth'"),
])
def test_each_subject_names_only_what_the_report_says(version, expected):
    prospect = SeoProspectFactory(subject_version=version, domain="business0.com.au", business="Business 0")
    assert subject_for(prospect) == expected
