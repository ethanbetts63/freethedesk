from datetime import datetime, timezone as dt_timezone
from io import StringIO
from zoneinfo import ZoneInfo

import pytest
from django.core.files.base import ContentFile
from django.core.management import call_command
from freetheplatform.messaging import Message, Suppression, suppress

from affiliates.management.commands import send_affiliate_outreach as command
from seo.models import SeoProspect
from seo.tests.factories import SeoProspectFactory
from seo.utils.prospect_links import report_link
from seo.utils.prospect_sending import (
    CLIENT_BODIES, FOLLOW_UP_LINE, UNSUBSCRIBE_LINE, body_for, follow_up_body, follow_up_subject_for, subject_for,
)

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


def test_the_hourly_run_emails_a_queued_report_with_its_link_and_no_pdf(outbox, monkeypatch):
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
    assert message.attachments == []
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
    """Paused, but a row that drew it still sends it, without the pdf like every email now."""
    """The second body is the server's fixed text: only the greeting and what the business counts change."""
    prospect = SeoProspectFactory(body_version=2, contact_name="Craig Smith", metric="calls")

    run(monkeypatch, perth(26, 10))

    [message] = outbox
    assert message.to == prospect.email
    assert message.body_text.startswith("Hi Craig,\n\nI spent three hours writing the attached website report.")
    assert "if your calls don't move in a month, mark this email as spam" in message.body_text
    assert UNSUBSCRIBE_LINE not in message.body_text
    assert message.attachments == []


def test_body_four_is_the_bet_with_five_titles_cut_to_a_line_and_the_rest_counted():
    prospect = SeoProspectFactory(
        body_version=4, contact_name="Mario Rossi", metric="quotes", recommendation_count=9,
        issues=[
            "Give every page a title and main headline that name its search, starting with 'kitchen cabinets perth'",
            "Take back the Google listing and make its categories, services and description match",
            "Shrink the photos",
            "Put the phone number and a quote button on the first screen of every page, and keep them in reach",
            "Publish what a kitchen, a laundry and a vanity typically cost, and what moves the price.",
            "A sixth, never shown",
        ],
    )

    body = body_for(prospect)

    assert body.startswith("Hi Mario,\n\nI spent three hours writing the attached website report.")
    assert "if your quotes don't move in a month" in body
    assert (
        "That's my marketing strategy.\n\n"
        "1. Give every page a title and main headline that\u2026\n"
        "2. Take back the Google listing and make its\u2026\n"
        "3. Shrink the photos\n"
        "4. Put the phone number and a quote button on the\u2026\n"
        "5. Publish what a kitchen, a laundry and a vanity\u2026\n"
        "(4 more)\n\n"
        "Forward the attached pdf to whoever runs your website."
    ) in body
    assert "A sixth" not in body and UNSUBSCRIBE_LINE not in body


def test_body_five_lists_every_fix_whole_and_links_the_report_in_the_owners_words():
    prospect = SeoProspectFactory(
        body_version=5, contact_name="Mario Rossi", recommendation_count=4,
        issues=["Shrink the photos", "Take back the Google listing and make its categories, services and description match",
                "Give every page a title and main headline that name its search, starting with 'kitchen cabinets perth'",
                "Link the hidden pages from the menu"],
    )

    body = body_for(prospect)

    assert body.startswith(
        "Hi Mario,\n\nI'm a real person who spent real time on this. My name's Ethan. I've written a list of fixes "
        "for your website. There's no obligation."
    )
    assert (
        "Here they are:\n\n"
        "1. Shrink the photos\n"
        "2. Take back the Google listing and make its categories, services and description match\n"
        "3. Give every page a title and main headline that name its search, starting with 'kitchen cabinets perth'\n"
        "4. Link the hidden pages from the menu\n\n"
        f"You can read the whole report here: {report_link(prospect, 'email')}\n\n"
        "Forward the link to whoever runs your website, if they disagree"
    ) in body
    assert "more)" not in body and "pdf" not in body and "ttached" not in body
    assert f"I can explain any part in detail. {UNSUBSCRIBE_LINE}\n\nEthan Betts" in body


@pytest.mark.parametrize("version", [*CLIENT_BODIES, SeoProspect.Body.AFFILIATE])
def test_every_body_in_rotation_and_its_follow_up_carries_the_way_out(version):
    """The Spam Act's unsubscribe statement, once, in each body a prospect can draw today and in the follow-up
    built from it."""
    prospect = SeoProspectFactory(body_version=version, follow_up_body_version=version,
                                  issues=["Fix the title"], recommendation_count=9)

    assert body_for(prospect).count(UNSUBSCRIBE_LINE) == 1
    assert follow_up_body(prospect).count(UNSUBSCRIBE_LINE) == 1


def host(**overrides):
    """A podcast host's held-then-approved report, with its page."""
    prospect = SeoProspectFactory(**{
        "purpose": "affiliate", "subject_version": 8, "body_version": 3, "business": "Money Secrets",
        "domain": "peachbm.com.au", "contact_name": "Fi Johnston", "recommendation_count": 4, "paid_searches": [],
        "issues": ["Retitle the home and program pages for their searches",
                   "Close the second Google listing and use one address",
                   "Add hours, a booking link and your programs to the listing",
                   "Fix the Challenge's buy buttons and the member videos"],
        **overrides,
    })
    prospect.report_html.save(f"{prospect.slug}_r1.html", ContentFile(b"<html></html>"), save=True)
    return prospect


def test_the_affiliate_body_is_the_owners_sample_and_the_offer_at_the_live_figures():
    """A podcast host gets every title, the report's link, and the program at the site settings' figures."""
    prospect = host()

    body = body_for(prospect)

    assert subject_for(prospect) == "Podcast affiliate offer for Money Secrets"
    assert body.startswith(
        "Hi Fi,\n\nI'm a real person who spent real time on this. My name's Ethan. I've written a list of fixes for "
        "your website. There's no obligation, and the fixes are worth doing.\n\n"
        "This is a sample so that you have an idea of what you'd be advertising if you're interested.\n\n"
    )
    assert (
        "Here they are:\n\n"
        "1. Retitle the home and program pages for their searches\n"
        "2. Close the second Google listing and use one address\n"
        "3. Add hours, a booking link and your programs to the listing\n"
        "4. Fix the Challenge's buy buttons and the member videos\n\n"
        f"You can read the whole report here: {report_link(prospect, 'email')}\n\n"
        "Forward the link to whoever runs your website"
    ) in body
    assert "more)" not in body
    assert ("Now the offer. We are running an affiliate program for podcasts. Your listeners get 20% off an SEO "
            "report with your code, and you get half of every report they buy: $220 to $560 each, paid after each "
            "sale. Everything's explained here: www.freethedesk.com.au/affiliates") in body
    assert "is yours free" not in body and "pdf" not in body


def test_a_report_without_a_page_waits_and_no_pdf_goes_in_its_place(outbox, monkeypatch):
    """Nothing but the link carries a report now: a row without a page is neither sent nor followed up."""
    SeoProspectFactory(report_html="")
    SeoProspectFactory(report_html="", sent_at=perth(19, 10), follow_up_queued_at=perth(26, 9),
                       follow_up_subject_version=7, follow_up_body_version=SeoProspect.Body.FIXES)

    run(monkeypatch, perth(26, 10))

    assert outbox == []


def test_a_hosts_report_and_follow_up_go_with_the_link_alone(outbox, monkeypatch):
    prospect = host()

    run(monkeypatch, perth(26, 10))

    [message] = outbox
    assert message.subject == "Podcast affiliate offer for Money Secrets"
    assert message.attachments == []
    assert report_link(prospect, "email") in message.body_text

    later = perth(27, 10)
    SeoProspect.objects.filter(pk=prospect.pk).update(follow_up_queued_at=later, follow_up_subject_version=8,
                                                      follow_up_body_version=3)
    run(monkeypatch, later)
    assert outbox[1].attachments == [] and outbox[1].subject == "Podcast affiliate offer for Money Secrets"


def test_outside_the_window_no_report_is_sent(outbox, monkeypatch):
    SeoProspectFactory()
    assert "Outside the sending window" in run(monkeypatch, perth(24, 10))
    assert outbox == []
    assert SeoProspect.objects.get().sent_at is None


def test_a_held_report_waits_for_the_owners_word(outbox, monkeypatch):
    held = SeoProspectFactory(approved_at=None)
    approved = SeoProspectFactory()

    run(monkeypatch, perth(26, 10))

    assert [m.to for m in outbox] == [approved.email]
    assert SeoProspect.objects.get(pk=held.pk).sent_at is None


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
    (6, "A list of fixes for business0.com.au"),
    (7, "What's wrong with business0.com.au, and how to fix it"),
    (8, "Podcast affiliate offer for Business 0"),
])
def test_each_subject_names_only_what_the_report_says(version, expected):
    prospect = SeoProspectFactory(subject_version=version, domain="business0.com.au", business="Business 0")
    assert subject_for(prospect) == expected


def test_the_follow_up_is_the_body_of_the_day_opening_with_the_follow_up_line():
    """The report email went as body 1; the follow-up is the client body chosen when it was queued."""
    prospect = SeoProspectFactory(contact_name="Tom Smith", body_version=SeoProspect.Body.REPORT,
                                  follow_up_body_version=SeoProspect.Body.FIXES,
                                  issues=["Fix the title"], recommendation_count=9)

    body = follow_up_body(prospect)

    assert FOLLOW_UP_LINE == "Just following up on my previous email, in case it got buried."
    assert body.startswith(f"Hi Tom,\n\n{FOLLOW_UP_LINE} I'm a real person who spent real time on this.")
    assert body.replace(f"{FOLLOW_UP_LINE} ", "", 1) == body_for(prospect, SeoProspect.Body.FIXES, source="follow-up")
    assert "I picked" in body_for(prospect)  # the report email itself is still body 1


def test_the_hourly_run_sends_a_queued_follow_up_once_with_the_link_and_no_pdf(outbox, monkeypatch):
    now = perth(27, 10)
    prospect = SeoProspectFactory(subject_version=6, body_version=SeoProspect.Body.REPORT,
                                  follow_up_subject_version=7, follow_up_body_version=SeoProspect.Body.FIXES,
                                  sent_at=perth(19, 10), follow_up_queued_at=now)
    stopped = SeoProspectFactory(sent_at=perth(19, 10), follow_up_queued_at=now, called_at=now,
                                 follow_up_subject_version=7, follow_up_body_version=SeoProspect.Body.FIXES)

    output = run(monkeypatch, now)

    assert "1 follow-up(s) sent." in output
    [message] = outbox
    # The follow-up's own subject, not the report email's.
    assert (message.to, message.message_type) == (prospect.email, "seo_prospect_follow_up.7")
    assert message.subject == follow_up_subject_for(prospect) == f"What's wrong with {prospect.domain}, and how to fix it"
    assert message.subject != subject_for(prospect)
    assert message.body_text == follow_up_body(prospect).rstrip()
    assert message.attachments == []
    assert report_link(prospect, "follow-up") in message.body_text
    prospect.refresh_from_db()
    stopped.refresh_from_db()
    assert prospect.followed_up_at == now and stopped.followed_up_at is None
    # The report email's own record is untouched: the dashboard status reads seo_prospect.* alone.
    assert prospect.sent_at == perth(19, 10)

    run(monkeypatch, now)
    assert len(outbox) == 1
