"""The first password for a paid signup, chosen on the payment confirmation page.

Payment makes the login and emails a temporary password. The browser that
filled in the signup form holds a single-use token for it (an httpOnly cookie
the signup's Server Action sets), and with it can choose the account's own
password straight after paying, which signs it in. The temporary password is
the fallback for anyone who closes the tab, pays on another device, or comes
back after the window.

The checkout reference alone is not enough: it sits in the URL, browser
history and Stripe's records. Only the hash of the token is kept, and it is
emptied once used.
"""

import hashlib
import secrets
from datetime import timedelta

from django.utils import timezone
from django.utils.crypto import constant_time_compare
from freetheplatform.auth import lockout

from ..models import SeoSubscriber

#: How long after payment the confirmation page can set the first password.
CLAIM_WINDOW = timedelta(hours=1)


def _digest(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def issue_password_claim(subscriber: SeoSubscriber) -> str:
    """Mint the token, keep only its hash, and return the plain value once."""
    token = secrets.token_urlsafe(32)
    subscriber.password_claim_hash = _digest(token)
    subscriber.save(update_fields=["password_claim_hash", "updated_at"])
    return token


def can_claim_password(subscriber: SeoSubscriber, token: str) -> bool:
    """Whether ``token`` may set this signup's first password now.

    It must match, the payment must have made the login within the window, and
    the account must still be on the temporary password: once its owner has
    chosen one, by this route or by signing in, there is nothing to claim.
    """
    if not token or not subscriber.password_claim_hash:
        return False
    if not constant_time_compare(_digest(token), subscriber.password_claim_hash):
        return False
    if subscriber.user_id is None or subscriber.status != SeoSubscriber.Status.ACTIVE:
        return False
    if not subscriber.has_paid or subscriber.status_changed_at is None:
        return False
    if timezone.now() - subscriber.status_changed_at > CLAIM_WINDOW:
        return False
    return lockout.state_for(subscriber.user).must_change_password
