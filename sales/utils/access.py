"""The credential that gets a customer into their own sale.

There are no accounts here and there will not be. A member of the public buying
one vehicle should not have to create a login they will use twice and forget,
and giving them one would make FreeTheDesk the custodian of a password they
reuse elsewhere.

What they get instead is a **capability scoped to one sale**: a signed link,
redeemed once for an httpOnly cookie that is scoped to that sale's own API path.
The reference and an emailed password recover it on another device.

Imports no models, so the sale views and the notification layer can both use it
without importing each other.
"""

import secrets

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone
from freetheplatform.auth import conf as auth_conf

from core.utils.urls import site_url

#: Avoids the characters people mistake for each other when reading a password
#: off a screen and typing it on a phone: no O/0, no I/l/1.
_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
_LENGTH = 12

COOKIE_PREFIX = "sale-access"
#: Six months. A sale runs for weeks and a customer comes back to it after
#: handover to download their documents, so a session-length cookie would put
#: them through the recovery form for no reason. Access ends with the sale
#: rather than with the clock — see ``access_has_ended``.
COOKIE_MAX_AGE = 60 * 60 * 24 * 180


def generate_access_password() -> str:
    """A plain temporary password. Only ever returned, never persisted as-is."""
    return "".join(secrets.choice(_ALPHABET) for _ in range(_LENGTH))


def set_access_password(sale, *, save=True) -> str:
    """Mint a password, store only its hash, and return the plain text.

    The caller is responsible for putting the returned value in front of the
    customer exactly once. It cannot be recovered afterwards, which is the
    point: a password we can read back is one a support conversation can leak.
    """
    plain = generate_access_password()
    sale.access_password_hash = make_password(plain)
    if save:
        sale.save(update_fields=["access_password_hash", "updated_at"])
    return plain


def check_access_password(sale, plain) -> bool:
    if not sale.access_password_hash or not plain:
        return False
    return check_password(plain, sale.access_password_hash)


def burn_a_hash() -> None:
    """Spend the cost of a password check against nothing.

    Called when there is no sale to check against, so that a reference nobody
    holds takes about as long to refuse as a reference somebody does. Without
    it the recovery form answers measurably faster for a reference that does
    not exist, which turns it into a way of finding out which do.

    The hash is minted once per process against a value nothing knows, so this
    can only ever fail.
    """
    global _DUMMY_HASH
    if _DUMMY_HASH is None:
        _DUMMY_HASH = make_password(secrets.token_urlsafe(32))
    check_password("x", _DUMMY_HASH)


_DUMMY_HASH = None


# --- lockout ----------------------------------------------------------------
#
# The same control the staff login has, reading the same two settings, because
# the two credentials have the same problem and two thresholds would be two
# numbers nobody could justify the difference between. `FTP_AUTH` ships 10
# failures and a 15-minute lock; `manage.py ftp_auth_config` prints what is in
# force, and changing it there moves both.
#
# Not a rate limit. Throttle counters live in a per-worker cache that is emptied
# by every deploy, so "ten attempts" really means "ten, in one process, since
# the last restart" — a cost control, not a credential control. This is a
# durable row, keyed on the thing being attacked, and it costs a write only on
# failure. `freetheplatform.auth.lockout` says the same thing at more length.
#
# Automatic expiry is not optional: a lock with no end is a way of switching a
# customer out of their own sale by typing at it.


def access_is_locked(sale) -> bool:
    """Whether recovery on this sale is locked right now.

    Reading is what unlocks, so nothing has to be scheduled: the lock ends at
    the owner's next attempt after it expires.
    """
    if sale.access_locked_until is None:
        return False
    if sale.access_locked_until <= timezone.now():
        clear_access_failures(sale)
        return False
    return True


def record_access_failure(sale):
    """Count a failed recovery attempt, locking the sale at the threshold."""
    sale.access_failure_count += 1
    if sale.access_failure_count >= auth_conf.get("LOCKOUT_THRESHOLD"):
        sale.access_locked_until = timezone.now() + auth_conf.get("LOCKOUT_DURATION")
    sale.save(update_fields=["access_failure_count", "access_locked_until", "updated_at"])
    return sale


def clear_access_failures(sale):
    """Forget the failures leading up to a success, or an expired lock.

    Written only when there is something to forget, so an ordinary sign-in stays
    a read.
    """
    if not sale.access_failure_count and sale.access_locked_until is None:
        return sale
    sale.access_failure_count = 0
    sale.access_locked_until = None
    sale.save(update_fields=["access_failure_count", "access_locked_until", "updated_at"])
    return sale


def access_has_ended(sale) -> bool:
    """Whether the capability has expired.

    Driven by status, not by the customer's checklist. A sale can have nothing
    outstanding from the customer for weeks while the dealer still owes them a
    vehicle, and locking them out at that point would take away the page they
    use to follow it.

    A cancelled sale ends access. A completed one deliberately does not: the
    signed documents are theirs, and the download they will want six months
    later is the one this exists to serve.
    """
    return sale.status == sale.Status.CANCELLED


def cookie_name(reference: str) -> str:
    return f"{COOKIE_PREFIX}-{reference}"


def cookie_path(reference: str) -> str:
    return f"/api/sales/{reference}/"


def set_access_cookie(response, sale):
    """Attach the sale's capability token as an httpOnly cookie.

    Scoped to this sale's own path so one sale's cookie is never offered up with
    a request about another, and httpOnly because nothing in the page needs to
    read it. This is the pattern section 12 of the security standard prescribes
    for a record that outlives a tab — a sale runs for weeks, and
    ``sessionStorage`` dies when the tab closes.

    Redeeming also takes the token out of the URL, so a link sitting in an inbox,
    forwarded or screenshotted, stops being a live credential once it has been
    redeemed on the customer's own device.
    """
    response.set_cookie(
        cookie_name(sale.reference),
        sale.access_token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        secure=settings.SESSION_COOKIE_SECURE,
        samesite="Lax",
        path=cookie_path(sale.reference),
    )
    return response


def sale_link(sale) -> str:
    return f"{site_url()}/sale/{sale.reference}/{sale.access_token}"
