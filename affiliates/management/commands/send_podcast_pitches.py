import logging
from zoneinfo import ZoneInfo

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone
from freetheplatform.messaging import Suppression

from affiliates.models import PodcastProspect
from affiliates.utils.pitching import pitch_figures, send_pitch

logger = logging.getLogger(__name__)

# Perth business hours, weekdays. About fifty a day at the default count, which
# is a pace a fresh sending domain can hold.
WINDOW_START = 8
WINDOW_END = 18


def in_sending_window(now):
    local = now.astimezone(ZoneInfo(settings.TIME_ZONE))
    return local.weekday() < 5 and WINDOW_START <= local.hour < WINDOW_END


def eligible_prospects():
    """Queued, not excluded, not signed up, and not on the suppression list; oldest first."""
    suppressed = Suppression.objects.filter(channel="email").values("address")
    return (
        PodcastProspect.objects.filter(pitched_at__isnull=True, excluded_reason="", affiliate__isnull=True)
        .exclude(email__in=suppressed)
        .order_by("created_at", "id")
    )


def claim(prospect, now):
    """True for exactly one of any number of concurrent runs."""
    return (
        PodcastProspect.objects.filter(pk=prospect.pk, pitched_at__isnull=True).update(pitched_at=now) == 1
    )


class Command(BaseCommand):
    help = (
        "Sends the next few podcast pitches. Runs hourly on PythonAnywhere next to send_due_messages, "
        "and only inside Perth business hours on weekdays unless --ignore-window is passed."
    )

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=5, help="Pitches to send this run (default 5).")
        parser.add_argument(
            "--ignore-window", action="store_true", help="Send now, whatever the hour. For a test send."
        )

    def handle(self, *args, **options):
        now = timezone.now()
        if not options["ignore_window"] and not in_sending_window(now):
            self.stdout.write("Outside the sending window; nothing sent.")
            return

        figures = pitch_figures()
        sent = 0
        # Over-fetch a little: a prospect claimed by a concurrent run is skipped, not counted.
        for prospect in eligible_prospects()[: options["count"] * 2]:
            if sent >= options["count"]:
                break
            if not claim(prospect, now):
                continue
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
