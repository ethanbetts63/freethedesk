from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from freetheplatform.auth import lockout

from core.utils.temporary_password import generate_temporary_password

from ..models import SeoProfile, SeoSubscriber
from .existing_account import find_existing_account
from .find_login import find_login
from .notifications import notify_staff_of_duplicate_payment, send_seo_welcome

DUPLICATE_PAYMENT_NOTE = (
    "Paid, but this email already had an account: refund it or move it onto that account."
)


def ensure_seo_profile(subscriber: SeoSubscriber) -> SeoProfile:
    # Seeds the brief from signup so it isn't blank; still editable.
    profile, _ = SeoProfile.objects.get_or_create(
        subscriber=subscriber,
        defaults={"website_url": subscriber.website},
    )
    return profile


def activate_paid_subscriber(subscriber: SeoSubscriber) -> None:
    """Make the login for a signup whose payment has just landed.

    Runs inside the payment webhook's transaction, on a row it has locked, and
    more than one payment event can call it for the same purchase. So it acts
    only on the first: the signup gets a login (a new one, or the passwordless
    one an unpaid signup made under the old flow), becomes active, and is sent
    a temporary password once the transaction commits. ``must_change_password``
    makes the first sign-in replace it.

    Checkout refuses an email that already has an account, but one can appear
    between checkout and payment. Then the money is in and there is no login
    to give it to, so staff are told to refund or merge by hand and the signup
    stays pending.
    """
    ensure_seo_profile(subscriber)
    if subscriber.status != SeoSubscriber.Status.PENDING:
        return
    if subscriber.user is None:
        if find_existing_account(subscriber.email):
            # The note doubles as the record that staff were told, so a second
            # event for the same purchase does not tell them again.
            if DUPLICATE_PAYMENT_NOTE not in subscriber.staff_notes:
                subscriber.staff_notes = "\n".join(
                    filter(None, [subscriber.staff_notes, DUPLICATE_PAYMENT_NOTE])
                )
                subscriber.save(update_fields=["staff_notes", "updated_at"])
                transaction.on_commit(lambda: notify_staff_of_duplicate_payment(subscriber))
            return
        subscriber.user = find_login(subscriber.email) or get_user_model().objects.create_user(
            username=subscriber.email[:150], email=subscriber.email, password=None
        )
        subscriber.save(update_fields=["user", "updated_at"])

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
