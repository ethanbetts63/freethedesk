"""The customer account behind a sale.

An account is one person's view over all their sales, keyed by email. It is
deliberately **not** how a sale is accessed — the per-sale token, password and
path-scoped cookie in ``sales.utils.access`` stay untouched, so every emailed
link keeps working for customers who never think about accounts.

Trust model: an account password only ever reaches its owner through their
email (the sale-link email, or a password reset), so holding an account session
proves control of the address, and it may therefore mint sale cookies (see
``sales.views.account``). Nothing goes the other way: a sale cookie can come
from a link the dealer mistyped an address into, and must never touch an
account credential.

Mirrors ``allbikes/inventory/utils/customer_accounts.py`` — the two products
deliberately share this shape.
"""

from django.contrib.auth import get_user_model

from freetheplatform.auth import lockout


def ensure_customer_account(sale, *, password=None):
    """Link ``sale`` to the account for its email, creating one if needed.

    ``password`` is the plain sale password the link email is about to carry. A
    **newly created** account adopts it as its first credential, flagged
    ``must_change_password`` so the first account sign-in asks for their own.
    An existing account is only ever linked; its password is never touched —
    a resend mints a new *sale* password, and rotating the account credential
    with it would lock out a customer who already chose their own.

    Returns ``(user, created)``. Idempotent.
    """
    User = get_user_model()
    email = (sale.customer_email or "").strip().lower()
    if not email:
        return None, False

    user = User.objects.filter(username__iexact=email).first()
    created = False
    if user is None:
        user = User(
            username=email,
            email=email,
            first_name=(sale.customer_name or "").strip()[:150],
        )
        if password:
            user.set_password(password)
        else:
            # No password to hand over (backfill): the account exists to be
            # claimed through a reset email.
            user.set_unusable_password()
        user.save()
        created = True
        if password:
            state = lockout.state_for(user)
            state.must_change_password = True
            state.save(update_fields=["must_change_password"])

    if sale.account_id != user.pk:
        sale.account = user
    return user, created
