"""What a paid audit owes the affiliate whose code bought it.

Called from the SEO payment callbacks in ``payments/fulfilment.py``, so both
functions run inside the webhook's transaction and obey its two rules: write
rows only, and be idempotent. Anything outward goes through ``on_commit``.
"""

from decimal import ROUND_HALF_UP, Decimal

from django.db import transaction
from django.utils import timezone

from core.models import SiteSettings

from ..models import Affiliate, Commission
from .notifications import notify_of_commission

OWN_PURCHASE_NOTE = "The affiliate bought this audit with their own code, so it earns nothing."


def affiliate_for_payment(payment):
    """The affiliate whose code this payment redeemed, or ``None``.

    Every code an affiliate holds names them as its owner, the sign-up one and
    the ones they added alike; the ``Affiliate.discount`` link is only the
    sign-up code.
    """
    redemption = getattr(payment, "discount_redemption", None)
    if redemption is None:
        return None
    owner = redemption.discount.owner
    return owner if isinstance(owner, Affiliate) else None


def share_of(sale_amount: Decimal) -> Decimal:
    percent = SiteSettings.load().affiliate_share_percent
    return (Decimal(sale_amount) * percent / 100).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def record_commission(payment, *, description: str):
    """One commission per paid payment that carried an affiliate's code.

    The share is half of what the listener paid (``total_amount``, after
    their discount): a straight split of the sale, which is what the affiliate
    page and the pitch emails promise. A second event for the same payment
    finds the row and leaves it.
    """
    affiliate = affiliate_for_payment(payment)
    if affiliate is None:
        return None
    existing = Commission.objects.filter(payment=payment).first()
    if existing is not None:
        return existing

    own_purchase = _buyer_email(payment) == affiliate.email.lower()
    commission = Commission.objects.create(
        affiliate=affiliate,
        payment=payment,
        description=description,
        sale_amount=payment.total_amount,
        amount=Decimal("0.00") if own_purchase else share_of(payment.total_amount),
        currency=payment.currency,
        status=Commission.Status.VOID if own_purchase else Commission.Status.OWED,
        note=OWN_PURCHASE_NOTE if own_purchase else "",
        voided_at=timezone.now() if own_purchase else None,
    )
    if not own_purchase:
        transaction.on_commit(lambda: notify_of_commission(commission))
    return commission


def void_commission(payment, *, reason: str):
    """A refund takes back an owed commission. A paid one is left for staff."""
    commission = Commission.objects.filter(payment=payment).first()
    if commission is None or commission.status != Commission.Status.OWED:
        return commission
    commission.status = Commission.Status.VOID
    commission.voided_at = timezone.now()
    commission.note = "\n".join(filter(None, [commission.note, reason]))
    commission.save(update_fields=["status", "voided_at", "note", "updated_at"])
    return commission


def _buyer_email(payment) -> str:
    related = payment.related
    return (getattr(related, "email", "") or "").lower()
