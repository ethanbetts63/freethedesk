from datetime import datetime, timezone as dt_timezone
from io import StringIO
from zoneinfo import ZoneInfo

import pytest
from django.core.management import call_command
from freetheplatform.messaging import Message, Suppression, suppress

from affiliates.tests.factories import AffiliateFactory
from affiliates.management.commands import send_podcast_pitches as command
from affiliates.models import PodcastProspect
from affiliates.tests.factories import ProspectFactory

pytestmark = pytest.mark.django_db

PERTH = ZoneInfo("Australia/Perth")


def perth(day, hour):
    """A fixed instant: 2026-10-26 is a Monday."""
    return datetime(2026, 10, day, hour, 30, tzinfo=PERTH).astimezone(dt_timezone.utc)


def run(*args, now=None, monkeypatch=None):
    if now is not None:
        monkeypatch.setattr(command.timezone, "now", lambda: now)
    out = StringIO()
    call_command("send_podcast_pitches", *args, stdout=out, stderr=out)
    return out.getvalue()


def test_the_window_is_perth_business_hours_on_weekdays():
    assert command.in_sending_window(perth(26, 8))
    assert command.in_sending_window(perth(26, 17))
    assert not command.in_sending_window(perth(26, 18))
    assert not command.in_sending_window(perth(26, 7))
    assert not command.in_sending_window(perth(24, 10))  # Saturday
    assert not command.in_sending_window(perth(25, 10))  # Sunday


def test_outside_the_window_nothing_is_sent(outbox, monkeypatch):
    ProspectFactory()
    output = run(now=perth(26, 20), monkeypatch=monkeypatch)
    assert "Outside the sending window" in output
    assert outbox == []
    assert PodcastProspect.objects.get().pitched_at is None


def test_sends_the_oldest_eligible_prospects_and_claims_them(outbox, monkeypatch):
    first = ProspectFactory(version="a", podcast_name="First")
    second = ProspectFactory(version="b", podcast_name="Second")
    third = ProspectFactory(version="c", podcast_name="Third")
    now = perth(26, 10)

    output = run("--count", "2", now=now, monkeypatch=monkeypatch)

    assert "2 sent." in output
    assert [m.to for m in outbox] == [first.email, second.email]
    assert [m.message_type for m in outbox] == ["podcast_pitch.a", "podcast_pitch.b"]
    first.refresh_from_db()
    third.refresh_from_db()
    assert first.pitched_at == now
    assert third.pitched_at is None
    assert Message.objects.filter(message_type__startswith="podcast_pitch.").count() == 2

    # The next run carries on from the third; the two already pitched are never pitched again.
    run("--count", "5", now=now, monkeypatch=monkeypatch)
    assert [m.to for m in outbox] == [first.email, second.email, third.email]


def test_skips_the_excluded_the_signed_up_and_the_suppressed(outbox, monkeypatch):
    ProspectFactory(excluded_reason="Asked us not to.")
    ProspectFactory(affiliate=AffiliateFactory())
    suppressed = ProspectFactory(email="gone@example.com")
    suppress(suppressed.email, reason=Suppression.Reason.BOUNCED)
    wanted = ProspectFactory(podcast_name="Wanted")

    run(now=perth(26, 10), monkeypatch=monkeypatch)

    assert [m.to for m in outbox] == [wanted.email]
    assert PodcastProspect.objects.filter(pitched_at__isnull=False).count() == 1


def test_a_prospect_claimed_by_a_concurrent_run_is_skipped(outbox, monkeypatch):
    prospect = ProspectFactory()
    now = perth(26, 10)
    assert command.claim(prospect, now)
    assert not command.claim(prospect, now)

    run(now=now, monkeypatch=monkeypatch)

    assert outbox == []


def test_ignore_window_sends_at_any_hour(outbox, monkeypatch):
    ProspectFactory()
    run("--ignore-window", now=perth(25, 3), monkeypatch=monkeypatch)
    assert len(outbox) == 1


def test_one_failure_does_not_stop_the_rest(outbox, monkeypatch):
    broken = ProspectFactory(podcast_name="Broken")
    fine = ProspectFactory(podcast_name="Fine")
    real = command.send_pitch

    def flaky(prospect, figures=None):
        if prospect.pk == broken.pk:
            raise RuntimeError("boom")
        return real(prospect, figures)

    monkeypatch.setattr(command, "send_pitch", flaky)

    output = run(now=perth(26, 10), monkeypatch=monkeypatch)

    assert "send failed" in output
    assert [m.to for m in outbox] == [fine.email]
    broken.refresh_from_db()
    assert broken.pitched_at is not None  # claimed, not re-pitched next hour
