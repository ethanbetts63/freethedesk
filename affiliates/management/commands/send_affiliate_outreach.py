import logging
import time
from zoneinfo import ZoneInfo

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone
from freetheplatform.messaging import Suppression

from affiliates.models import PodcastProspect
from affiliates.utils.pitching import ACTIVE_VERSIONS, PAUSED_VERSIONS, next_version, pitch_figures, send_pitch
from seo.utils import prospect_sending

logger = logging.getLogger(__name__)

# Perth business hours, weekdays. About thirty a day at the default count, which
# is a pace a fresh sending domain can hold (owner's number, 2026-10-26).
WINDOW_START = 8
WINDOW_END = 18
# Between one send and the next, so a run's pitches do not land as a burst.
PAUSE_SECONDS = 10


def in_sending_window(now):
    local = now.astimezone(ZoneInfo(settings.TIME_ZONE))
    return local.weekday() < 5 and WINDOW_START <= local.hour < WINDOW_END


# What `set_aside_unfit` writes on a queued medium or low row. Blanking it on the
# prospect's page is the way back, and only a high rating makes the row eligible.
UNFIT_REASON = "Not a high-fit show: only high relevance is pitched (owner, 2026-10-30)."


def queued_prospects():
    """Never claimed, not excluded, not signed up: the rows a rating still decides."""
    return PodcastProspect.objects.filter(pitched_at__isnull=True, excluded_reason="", affiliate__isnull=True)


def eligible_prospects():
    """Queued, rated high fit, and not on the suppression list; oldest first.

    Only a high-fit show is pitched (owner, 2026-10-30: 108 pitches to the whole
    list, 58% of it rated low, drew no reply and three spam complaints). An
    unrated row is never pitched either; it waits for a rating.
    """
    suppressed = Suppression.objects.filter(channel="email").values("address")
    return (
        queued_prospects()
        .filter(relevance=PodcastProspect.Relevance.HIGH)
        .exclude(email__in=suppressed)
        .order_by("created_at", "id")
    )


def set_aside_unfit():
    """Exclude the queued rows rated medium or low, so the dashboard shows them set aside, not waiting.

    Runs every hour, paused or not, so the list is honest the run after the rule
    lands. Unrated rows are left queued: they were never judged.
    """
    return queued_prospects().filter(
        relevance__in=[PodcastProspect.Relevance.MEDIUM, PodcastProspect.Relevance.LOW]
    ).update(excluded_reason=UNFIT_REASON, updated_at=timezone.now())


def reassign_paused():
    """Move queued prospects off a paused version, so pausing one never strands anyone.

    Each goes to whichever active version has the fewest prospects, the same
    rule upload uses. Sent rows keep their version: that is history.
    """
    moved = 0
    for prospect in eligible_prospects().filter(version__in=PAUSED_VERSIONS):
        prospect.version = next_version()
        prospect.save(update_fields=["version"])
        moved += 1
    return moved


def candidates(count):
    """The oldest eligible prospect of each active version in turn: a, c, a, c...

    A run therefore alternates, and the test stays even hour by hour rather
    than only over the whole queue. A version with nothing left gives its turns
    to the others. Each version is over-fetched to `count` because a prospect
    claimed by a concurrent run is skipped, not counted.
    """
    pending = {
        version: iter(list(eligible_prospects().filter(version=version)[:count])) for version in ACTIVE_VERSIONS
    }
    while pending:
        for version in list(pending):
            prospect = next(pending[version], None)
            if prospect is None:
                del pending[version]
            else:
                yield prospect


def claim(prospect, now):
    """True for exactly one of any number of concurrent runs."""
    return (
        PodcastProspect.objects.filter(pk=prospect.pk, pitched_at__isnull=True).update(pitched_at=now) == 1
    )


class Command(BaseCommand):
    help = (
        "Sends any queued prospect report emails (_docs/seo-prospect-outreach.md), and the next few "
        "podcast pitches when --count says so: the pitches are paused (owner, 2026-10-30), so the default "
        "sends none, and only a show rated high fit is ever pitched. Runs hourly on PythonAnywhere next to "
        "send_due_messages, and only inside Perth business hours on weekdays unless --ignore-window is passed."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--count", type=int, default=0,
            help="Podcast pitches to send this run. Default 0: the pitches are paused; pass 3 to resume the old pace.",
        )
        parser.add_argument(
            "--reports", type=int, default=5, help="Prospect report emails to send this run (default 5)."
        )
        parser.add_argument(
            "--ignore-window", action="store_true", help="Send now, whatever the hour. For a test send."
        )

    def handle(self, *args, **options):
        now = timezone.now()
        if not options["ignore_window"] and not in_sending_window(now):
            self.stdout.write("Outside the sending window; nothing sent.")
            return

        set_aside = set_aside_unfit()
        if set_aside:
            self.stdout.write(f"{set_aside} set aside: not high fit.")
        unrated = queued_prospects().filter(relevance="").count()
        if unrated:
            self.stdout.write(f"{unrated} queued without a rating; none of them is pitched.")
        set_aside = set_aside_unfit()
        if set_aside:
            self.stdout.write(f"{set_aside} set aside: not high fit.")
        unrated = queued_prospects().filter(relevance="").count()
        if unrated:
            self.stdout.write(f"{unrated} queued without a rating; none of them is pitched.")
        sent = 0
        if options["count"]:
            moved = reassign_paused()
            if moved:
                self.stdout.write(f"{moved} moved off a paused version.")
            figures = pitch_figures()
        for prospect in candidates(options["count"]) if options["count"] else ():
            if sent >= options["count"]:
                break
            if not claim(prospect, now):
                continue
            if sent:
                time.sleep(PAUSE_SECONDS)
            # One failure must not stop the rest. The row stays claimed: the
            # failed message is in the log for staff to resend, not re-pitch.
            try:
                message = send_pitch(prospect, figures)
            except Exception:
                self.stderr.write(f"{prospect.email}: send failed.")
                logger.exception("Podcast pitch failed for prospect %s", prospect.pk)
                continue
            sent += 1
            self.stdout.write(f"{prospect.version.upper()} -> {prospect.email} ({prospect.podcast_name}): {message.status}")
        self.stdout.write(f"{sent} sent.")
        self.send_reports(now, options["reports"], pause=bool(sent))

    def send_reports(self, now, count, pause):
        """The prospect report emails, in the same window, ten seconds apart like the pitches."""
        sent = 0
        for prospect in prospect_sending.eligible_prospects()[: count * 2]:
            if sent >= count:
                break
            if not prospect_sending.claim(prospect, now):
                continue
            if sent or pause:
                time.sleep(PAUSE_SECONDS)
            # As for a pitch: the row stays claimed, and the failed message is in the log to resend.
            try:
                message = prospect_sending.send_prospect(prospect)
            except Exception:
                self.stderr.write(f"{prospect.email}: report email failed.")
                logger.exception("Prospect report email failed for prospect %s", prospect.pk)
                continue
            sent += 1
            self.stdout.write(f"Report {prospect.subject_version} -> {prospect.email} ({prospect.business}): {message.status}")
        self.stdout.write(f"{sent} report email(s) sent.")
