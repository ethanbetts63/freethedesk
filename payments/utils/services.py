from dataclasses import dataclass
from decimal import Decimal

from freetheplatform.payments import (
    CheckoutError, ensure_billing_customer, start_checkout,
)

from core.models import SiteSettings
from dealers.models import Dealer

from .agreements import (
    AgreementConfigurationError,
    DEALER_ACCEPTANCE_STATEMENT,
    DEALER_AGREEMENT_KEY,
    dealer_offer_context,
    publish_configured_agreement,
    record_checkout_acceptance,
)
from ..flows import DEALER_SUBSCRIPTION


class PaymentConfigurationError(Exception):
    """A safe, coded error that can be returned while preparing checkout."""

    def __init__(self, message, *, code="unavailable"):
        super().__init__(message)
        self.code = code


@dataclass(frozen=True)
class SubscriptionQuote:
    plan: str
    name: str
    monthly_price: Decimal
    currency: str = "aud"

    @property
    def unit_amount(self):
        return int((self.monthly_price * Decimal("100")).quantize(Decimal("1")))


PLAN_DETAILS = {
    Dealer.Plan.LICENSING: ("licensing_price", "Online licensing"),
    Dealer.Plan.CONTRACTS: ("contracts_price", "Online contracts"),
    Dealer.Plan.COMPLETE: ("complete_price", "Licensing + contracts"),
}


def quote_for_plan(plan):
    details = PLAN_DETAILS.get(plan)
    if not details:
        raise PaymentConfigurationError("This subscription plan is unavailable.", code="invalid_plan")
    field_name, name = details
    price = getattr(SiteSettings.load(), field_name)
    return SubscriptionQuote(plan=plan, name=name, monthly_price=price)


def accept_current_offer(*, dealer, user, accepted_ip, user_agent=""):
    quote = quote_for_plan(dealer.plan)
    try:
        agreement_version = publish_configured_agreement(
            DEALER_AGREEMENT_KEY
        )
    except AgreementConfigurationError as error:
        raise PaymentConfigurationError(str(error)) from error
    acceptance = record_checkout_acceptance(
        agreement_version=agreement_version,
        accepted_by=user,
        related=dealer,
        accepted_ip=accepted_ip,
        user_agent=user_agent,
        statement=DEALER_ACCEPTANCE_STATEMENT,
        context=dealer_offer_context(quote),
    )
    return acceptance, quote


def create_or_reuse_checkout_session(dealer, acceptance, quote):
    """Prepare the dealer's Stripe checkout and return its client secret.

    The commercial decisions are above: what the plan costs, who may buy it,
    which agreement applies. Everything below them — reusing an unchanged
    offer, expiring a superseded one, the idempotency key, the payment record
    — is the package's, because none of it is specific to a dealer.
    """
    if dealer.payment_status == Dealer.PaymentStatus.ACTIVE:
        raise PaymentConfigurationError("This subscription is already active.", code="active")

    try:
        billing_customer = ensure_billing_customer(
            related=dealer,
            email=dealer.user.email,
            name=dealer.business_name,
            label=dealer.business_name,
            phone=dealer.phone or "",
        )
        payment, client_secret = start_checkout(
            flow=DEALER_SUBSCRIPTION,
            related=dealer,
            related_label=dealer.business_name,
            billing_customer=billing_customer,
            purpose=dealer.plan,
            items=[{
                "key": f"dealer.{dealer.plan}",
                "name": quote.name,
                "unit_amount": quote.monthly_price,
                "recurring": {"interval": "month"},
            }],
            # Stated, not omitted: the entity is not registered for GST, and
            # the package refuses to infer a tax position from silence.
            # See _docs/stripe-subscriptions.md.
            tax_mode="none",
            return_path="/licensing/payment/complete",
            agreement_acceptance_id=str(acceptance.pk),
            # Non-sensitive, and the thing support looks for when
            # reading a Stripe object from the other end.
            reference=str(dealer.pk),
        )
    except CheckoutError as error:
        raise PaymentConfigurationError(str(error), code=error.code) from error

    dealer.stripe_customer_id = billing_customer.stripe_customer_id
    dealer.save(update_fields=["stripe_customer_id", "updated_at"])
    return client_secret
