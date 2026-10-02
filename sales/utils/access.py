"""The sale capability, and the temporary password that seeds the account.

Access to one sale is a **capability**: a signed link, redeemed once for an
httpOnly cookie scoped to that sale's own API path. Recovery on another device
goes through the customer's account (``sales.views.account``), whose open
bridge mints the same cookie — the reference+password sale login this file
used to arm is retired, so the password minted below has exactly one job left:
the account's first credential (``customer_accounts.py``). The hash kept on
the sale records that a link has been sent.

Imports no models, so the sale views and the notification layer can both use it
without importing each other.
"""

from django.conf import settings
from django.contrib.auth.hashers import make_password

from core.utils.temporary_password import generate_temporary_password
from core.utils.urls import site_url

COOKIE_PREFIX = "sale-access"
#: Six months. A sale runs for weeks and a customer comes back to it after
#: handover to download their documents, so a session-length cookie would put
#: them through the recovery form for no reason. Access ends with the sale
#: rather than with the clock — see ``access_has_ended``.
COOKIE_MAX_AGE = 60 * 60 * 24 * 180


def set_access_password(sale, *, save=True) -> str:
    """Mint a password, store only its hash, and return the plain text.

    The caller is responsible for putting the returned value in front of the
    customer exactly once. It cannot be recovered afterwards, which is the
    point: a password we can read back is one a support conversation can leak.
    """
    plain = generate_temporary_password()
    sale.access_password_hash = make_password(plain)
    if save:
        sale.save(update_fields=["access_password_hash", "updated_at"])
    return plain




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
