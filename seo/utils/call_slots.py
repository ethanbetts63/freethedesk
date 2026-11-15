"""The times a free SEO review call can be booked, from the owner's call settings (``SeoCallSettings``).

The owner's rules (2026-11-15):
- People book whenever they like, with no cap on calls.
- The owner sets the notice, the hours and the days in the dashboard.

Here that means every half hour between the set times, on the ticked days, from the notice onward,
for ``weeks_shown`` weeks. Booked slots are left out, because the owner can take only one phone
call at a time. Perth has no daylight saving, so a Perth wall-clock time is exactly one UTC instant.
"""

from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from django.utils import timezone

PERTH = ZoneInfo("Australia/Perth")
CALL_LENGTH = timedelta(minutes=30)


def _day_slots(day: date, settings):
    start = datetime.combine(day, settings.start_time, tzinfo=PERTH)
    end = datetime.combine(day, settings.end_time, tzinfo=PERTH)
    while start + CALL_LENGTH <= end:
        yield start
        start += CALL_LENGTH


def candidate_slots(settings=None, now: datetime | None = None) -> list[datetime]:
    """Every slot the settings allow, before taking out the ones already booked."""
    from seo.models import SeoCallSettings

    settings = settings or SeoCallSettings.load()
    now = now or timezone.now()
    earliest = now + timedelta(days=settings.booking_advance_notice)
    latest = earliest + timedelta(weeks=settings.weeks_shown)
    days = settings.open_weekdays()
    slots = []
    day = earliest.astimezone(PERTH).date()
    while day <= latest.astimezone(PERTH).date():
        if day.weekday() in days:
            slots.extend(slot for slot in _day_slots(day, settings) if earliest <= slot <= latest)
        day += timedelta(days=1)
    return slots


def available_slots(settings=None, now: datetime | None = None) -> list[datetime]:
    """The slots that can still be booked: allowed by the settings and not already taken."""
    from seo.models import SeoCallBooking

    slots = candidate_slots(settings, now)
    if not slots:
        return []
    taken = set(
        SeoCallBooking.objects.exclude(status=SeoCallBooking.Status.CANCELLED)
        .filter(starts_at__gte=slots[0], starts_at__lte=slots[-1])
        .values_list("starts_at", flat=True)
    )
    return [slot for slot in slots if slot not in taken]


def is_available(starts_at: datetime) -> bool:
    return starts_at in set(available_slots())


def perth_label(starts_at: datetime) -> str:
    """For example 'Thursday 20 November, 10:30am (Perth time)'."""
    local = starts_at.astimezone(PERTH)
    hour = local.strftime("%I").lstrip("0")
    return f"{local:%A} {local.day} {local:%B}, {hour}:{local:%M}{local.strftime('%p').lower()} (Perth time)"
