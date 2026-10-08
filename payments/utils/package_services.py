"""Package checkout: the terms accepted on the order form, and the Stripe session.

What happens once a package payment lands is in ``payments/fulfilment.py``. The price and the
share due now are ``core.utils.package_pricing``'s; this module only refuses to charge anything
other than what the customer agreed to.
"""

from freetheplatform.agreements import Acceptance
from freetheplatform.payments import CheckoutError, ensure_billing_customer, start_checkout

from core.utils.package_pricing import quote_package

from ..flows import PACKAGE_ORDER
from .agreements import (
    AgreementConfigurationError,
    PACKAGE_ACCEPTANCE_STATEMENT,
    PACKAGE_AGREEMENT_KEY,
    package_offer_context,
    publish_configured_agreement,
    record_checkout_acceptance,
)
from .services import PaymentConfigurationError


def _current_package_agreement():
    try:
        return publish_configured_agreement(PACKAGE_AGREEMENT_KEY)
    except AgreementConfigurationError as error:
        raise PaymentConfigurationError(str(error)) from error


def _refuse_paid(order):
    if order.has_paid:
        raise PaymentConfigurationError("This order is already paid.", code="active")


def accept_current_package_offer(*, order, accepted_ip, user_agent=""):
    """Record the terms ticked on the order form. Nobody is signed in, so the acceptance names the
    order and the email typed into it."""
    _refuse_paid(order)
    quote = quote_package(order.package)
    return record_checkout_acceptance(
        agreement_version=_current_package_agreement(),
        accepted_by=None,
        actor_snapshot={"email": order.email},
        related=order,
        accepted_ip=accepted_ip,
        user_agent=user_agent,
        statement=PACKAGE_ACCEPTANCE_STATEMENT,
        context=package_offer_context(quote),
    )


def order_package_acceptance(order):
    """The acceptance made on the order form, and the quote it covers.

    Checkout charges only what was agreed to: if the price, the split or the terms changed after
    the order was made, no acceptance matches and the customer is sent back to order again.
    """
    _refuse_paid(order)
    quote = quote_package(order.package)
    if quote.price == order.price and quote.due_now == order.due_now:
        context = package_offer_context(quote)
        acceptances = Acceptance.objects.for_related(order).filter(
            agreement_version=_current_package_agreement()
        )
        for acceptance in acceptances:
            if (
                acceptance.context == context
                and acceptance.statement == PACKAGE_ACCEPTANCE_STATEMENT
            ):
                return acceptance, quote
    raise PaymentConfigurationError(
        "The price or terms have changed since you ordered. "
        "Choose your package again to agree to the current ones.",
        code="offer_changed",
    )


def create_or_reuse_package_checkout_session(order, acceptance, quote):
    """Prepare the order's checkout and return its client secret: one line, for what is due now."""
    _refuse_paid(order)
    name = f"{quote.name}: first half" if quote.is_deposit else quote.name
    try:
        billing_customer = ensure_billing_customer(
            related=order,
            email=order.email,
            name=order.business_name,
            label=order.business_name,
            phone=order.phone or "",
        )
        _payment, client_secret = start_checkout(
            flow=PACKAGE_ORDER,
            related=order,
            related_label=order.business_name or order.email,
            billing_customer=billing_customer,
            purpose=order.package,
            items=[{"key": f"package.{order.package}", "name": name, "unit_amount": quote.due_now}],
            # Not registered for GST: see payments/utils/services.py.
            tax_mode="none",
            return_path=f"/order/payment/complete?ref={order.checkout_reference}",
            agreement_acceptance_id=str(acceptance.pk),
            reference=str(order.pk),
        )
    except CheckoutError as error:
        raise PaymentConfigurationError(str(error), code=error.code) from error

    order.stripe_customer_id = billing_customer.stripe_customer_id
    order.save(update_fields=["stripe_customer_id", "updated_at"])
    return client_secret
