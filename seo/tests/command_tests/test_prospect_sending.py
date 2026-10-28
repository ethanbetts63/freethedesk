from datetime import datetime, timezone as dt_timezone
from io import StringIO
from zoneinfo import ZoneInfo

import pytest
from django.core.management import call_command
from freetheplatform.messaging import Message, Suppression, suppress

from affiliates.management.commands import send_affiliate_outreach as command
from seo.models import SeoProspect
from seo.tests.factories import PDF, SeoProspectFactory
from seo.utils.prospect_sending import UNSUBSCRIBE_LINE, subject_for

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
    assert message.body_text.endswith(UNSUBSCRIBE_LINE)
    assert message.attachments == [{"name": f"{prospect.slug}_seo_report_r1.pdf", "size": len(PDF)}]
    prospect.refresh_from_db()
    assert prospect.sent_at == now
    assert Message.objects.get().content_object == prospect

    # Sent once: the next run finds nothing.
    run(monkeypatch, now)
    assert len(outbox) == 1


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


def test_a_body_that_already_offers_the_way_out_is_left_alone(outbox, monkeypatch):
    SeoProspectFactory(body="Hi there,\n\nReply 'no thanks' if you'd rather I didn't.\n\nEthan Betts")
    run(monkeypatch, perth(26, 10))
    assert outbox[0].body_text.count("no thanks") == 1


def test_reports_go_ten_seconds_apart_and_after_the_pitches(outbox, monkeypatch):
    SeoProspectFactory()
    SeoProspectFactory()
    sleeps = []

    output = run(monkeypatch, perth(26, 10), "--reports", "5", sleeps=sleeps)

    assert "2 report email(s) sent." in output
    assert sleeps == [command.PAUSE_SECONDS]


@pytest.mark.parametrize("version, expected", [
    (1, "I spent 4 hours on this. I am not a bot."),
    (2, "10 free fixes for business0.com.au"),
    (4, "A free SEO report for Business 0"),
    (5, "Business 0 isn't on Google's first page for 'plumber perth'"),
])
def test_each_subject_names_only_what_the_report_says(version, expected):
    prospect = SeoProspectFactory(subject_version=version, domain="business0.com.au", business="Business 0")
    assert subject_for(prospect) == expected
