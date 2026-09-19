"""Creating the shared payment record alongside FreeTheDesk's own checkout.

A bridge, and deliberately temporary. Phase 2 moves webhook handling onto
``freetheplatform.payments`` while leaving checkout where it is, which leaves a
gap: the package's handlers find a payment through ``ftp_payment`` metadata, and
nothing was writing one. So checkout now creates the record and stamps the
metadata, while still building its own Stripe session.

Phase 3 deletes this file. ``start_checkout`` does all of it in one call, and
does it before Stripe is called rather than beside it.

See ../../freetheplatform/_docs/payments-migration.md.
"""

from decimal import Decimal

from django.contrib.contenttypes.models import ContentType
from freetheplatform.payments import (
    Payment, PaymentStatus, build_quote, ensure_billing_customer, quote_hash,
)


def billing_customer_for(*, related, email, name, phone=""):
    """Map a dealer or subscriber to its Stripe Customer.

    Existing accounts already have a ``stripe_customer_id``; the backfill
    migration turned those into ``BillingCustomer`` rows, so this only calls
    Stripe for somebody genuinely new.
    """
    return ensure_billing_customer(
        related=related, email=email, name=name, label=name, phone=phone
    )


def record_payment(
    *, flow, related, related_label, billing_customer, items, mode,
    purpose="", agreement_acceptance_id="",
):
    """Write the shared ``Payment`` this checkout is about.

    ``tax_mode="none"`` is stated rather than left out: the entity taking these
    payments is not registered for GST, and the package refuses to infer a tax
    position. See ``_docs/stripe-subscriptions.md``.
    """
    quote = build_quote(items=items, currency="aud", tax_mode="none")
    content_type = ContentType.objects.get_for_model(related, for_concrete_model=False)

    # Anything still open describes an offer that is being replaced, exactly as
    # the old checkout code expires the superseded Stripe session.
    Payment.objects.for_related(related).filter(flow=flow).open().update(
        status=PaymentStatus.EXPIRED
    )

    return Payment.objects.create(
        flow=flow,
        purpose=purpose,
        related_content_type=content_type,
        related_object_id=str(related.pk),
        related_label=related_label,
        billing_customer=billing_customer,
        mode=mode,
        status=PaymentStatus.PENDING,
        currency=quote["currency"],
        subtotal_amount=Decimal(quote["subtotal"]),
        discount_amount=Decimal(quote["discount"]),
        total_amount=Decimal(quote["total"]),
        tax_mode="none",
        quote=quote,
        quote_sha256=quote_hash(quote),
        agreement_acceptance_id=str(agreement_acceptance_id or ""),
    )


def attach_session(payment, session_id):
    payment.stripe_checkout_session_id = session_id
    payment.save(update_fields=["stripe_checkout_session_id", "updated_at"])
