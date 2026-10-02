"""The setup checklist a paid SEO subscriber works through.

Search Console is the only step reporting needs, and reporting starts the moment
it is confirmed. Every other step is optional and simply stays unticked if the
customer doesn't use that tool.

A step moves not started → marked done → confirmed. The customer can mark and
unmark; only a passing access check or staff can confirm, and the customer can't
take a confirmation back.
"""

from django.db import transaction
from django.utils import timezone

from ..models import SeoSetupStep, SeoSubscriber
from . import google_access
from .notifications import notify_staff_of_marked_step, notify_staff_reporting_can_start
from .services import ensure_seo_profile


Key = SeoSetupStep.Key
State = SeoSetupStep.State

#: The order the setup page shows them in.
STEP_ORDER = (
    Key.SEARCH_CONSOLE,
    Key.GOOGLE_ANALYTICS,
    Key.BUSINESS_PROFILE,
    Key.GOOGLE_ADS,
    Key.CLARITY,
    Key.ENQUIRIES,
)
REQUIRED_STEPS = frozenset({Key.SEARCH_CONSOLE})

#: The steps our service account can verify for itself, and how.
CHECKS = {
    Key.SEARCH_CONSOLE: google_access.find_search_console_property,
    Key.GOOGLE_ANALYTICS: google_access.find_analytics_property,
}


def setup_steps(subscriber: SeoSubscriber) -> list[SeoSetupStep]:
    """Every step for this subscriber, in page order, creating any missing."""
    existing = {step.key: step for step in subscriber.setup_steps.all()}
    missing = [SeoSetupStep(subscriber=subscriber, key=key) for key in STEP_ORDER if key not in existing]
    if missing:
        SeoSetupStep.objects.bulk_create(missing, ignore_conflicts=True)
        existing = {step.key: step for step in subscriber.setup_steps.all()}
    return [existing[key] for key in STEP_ORDER]


def is_setup_complete(subscriber: SeoSubscriber) -> bool:
    """True once every required step is confirmed, which is when reporting starts."""
    return SeoSetupStep.objects.filter(
        subscriber=subscriber, key__in=REQUIRED_STEPS, state=State.CONFIRMED
    ).count() == len(REQUIRED_STEPS)


def mark_step(step: SeoSetupStep, *, done: bool) -> SeoSetupStep:
    """The customer saying they have (or haven't) done a step."""
    if step.state == State.CONFIRMED:
        return step
    if done and step.state != State.MARKED_DONE:
        step.state = State.MARKED_DONE
        step.marked_done_at = timezone.now()
        step.save(update_fields=["state", "marked_done_at", "updated_at"])
        transaction.on_commit(lambda: notify_staff_of_marked_step(step))
    elif not done and step.state == State.MARKED_DONE:
        step.state = State.NOT_STARTED
        step.marked_done_at = None
        step.save(update_fields=["state", "marked_done_at", "updated_at"])
    return step


def confirm_step(step: SeoSetupStep, *, detail: str = "") -> SeoSetupStep:
    """Record that the access works. Telling staff happens once, on the first confirmation."""
    newly_confirmed = step.state != State.CONFIRMED
    step.state = State.CONFIRMED
    step.confirmed_at = step.confirmed_at if not newly_confirmed else timezone.now()
    step.detail = detail[:255] or step.detail
    step.save(update_fields=["state", "confirmed_at", "detail", "updated_at"])

    if step.key == Key.SEARCH_CONSOLE and detail:
        profile = ensure_seo_profile(step.subscriber)
        profile.search_console_property = detail[:255]
        profile.save(update_fields=["search_console_property", "updated_at"])

    if newly_confirmed and step.key in REQUIRED_STEPS:
        subscriber = step.subscriber
        transaction.on_commit(
            lambda: is_setup_complete(subscriber) and notify_staff_reporting_can_start(subscriber)
        )
    return step


def reset_step(step: SeoSetupStep) -> SeoSetupStep:
    """Staff undoing a confirmation, e.g. after the access was removed."""
    step.state = State.NOT_STARTED
    step.marked_done_at = None
    step.confirmed_at = None
    step.detail = ""
    step.save(update_fields=["state", "marked_done_at", "confirmed_at", "detail", "updated_at"])
    return step


def look_up_access(subscriber: SeoSubscriber, key: str) -> str:
    """Ask Google what our service account can read for this step, or ``""``.

    Makes network calls, so callers keep it outside any transaction and confirm
    afterwards. Raises ``google_access.AccessCheckUnavailable`` when the check
    couldn't run, which says nothing about the customer's setup.
    """
    if key not in CHECKS:
        raise ValueError(f"{key} has no automatic check.")
    profile = ensure_seo_profile(subscriber)
    return CHECKS[key](profile.website_url or subscriber.website)
