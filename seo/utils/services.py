from django.db import transaction
from django.utils import timezone
from freetheplatform.auth import lockout

from core.utils.temporary_password import generate_temporary_password

from ..models import SeoProfile, SeoSubscriber
from .notifications import send_seo_welcome


def ensure_seo_profile(subscriber: SeoSubscriber) -> SeoProfile:
    # Seeds the brief from signup so it isn't blank; still editable.
    profile, _ = SeoProfile.objects.get_or_create(
        subscriber=subscriber,
        defaults={"website_url": subscriber.website},
    )
    return profile


def activate_paid_subscriber(subscriber: SeoSubscriber) -> None:
    """Open the dashboard for a subscriber whose payment has just landed.

    Runs inside the payment webhook's transaction, on a row it has locked, and
    more than one payment event can call it for the same purchase. So it acts
    only on the first: a pending account becomes active, gets a temporary
    password if it has none, and is sent the welcome email once the transaction
    commits. Signup creates the login without a password, so the welcome email
    is the only way back in on another device. ``must_change_password`` makes
    the first sign-in replace it.
    """
    ensure_seo_profile(subscriber)
    if subscriber.status != SeoSubscriber.Status.PENDING:
        return

    subscriber.status = SeoSubscriber.Status.ACTIVE
    subscriber.status_changed_at = timezone.now()
    subscriber.save(update_fields=["status", "status_changed_at", "updated_at"])

    user = subscriber.user
    password = None
    if not user.has_usable_password():
        password = generate_temporary_password()
        user.set_password(password)
        user.save(update_fields=["password"])
        state = lockout.state_for(user)
        state.must_change_password = True
        state.save(update_fields=["must_change_password"])

    transaction.on_commit(lambda: send_seo_welcome(subscriber, password))
