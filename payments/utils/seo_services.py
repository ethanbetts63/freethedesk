"""SEO checkout: quoting, agreement acceptance, and the Stripe session.

Webhook handling moved to ``freetheplatform.payments``; what happens once an
SEO payment succeeds is in ``payments/flows.py``.
"""

from dataclasses import dataclass
from decimal import Decimal

from freetheplatform.payments import (
    CheckoutError, ensure_billing_customer, start_checkout,
)

from core.models import SiteSettings
from seo.models import SeoSubscriber

from ..flows import SEO_ONEOFF, SEO_SUBSCRIPTION
from .agreements import (
    AgreementConfigurationError,
    SEO_AGREEMENT_KEY,
    publish_configured_agreement,
    record_checkout_acceptance,
    seo_acceptance_statement,
    seo_offer_context,
)
from .services import PaymentConfigurationError


@dataclass(frozen=True)
class SeoQuote:
    plan: str
    name: str
    price: Decimal
    recurring: dict | None
    currency: str = "aud"

    @property
    def mode(self) -> str:
        return "payment" if self.recurring is None else "subscription"


def _every(months):
    return {"interval": "month", "interval_count": months}


# Customer-facing name and Stripe recurring config (None = one-off). Every
# recurring plan bills the same per-cycle price; only the interval differs.
SEO_PLAN_DETAILS = {
    SeoSubscriber.Plan.MONTHLY: ("Monthly SEO subscription", _every(1)),
    SeoSubscriber.Plan.BIMONTHLY: ("SEO subscription, every two months", _every(2)),
    SeoSubscriber.Plan.QUARTERLY: ("Quarterly SEO subscription", _every(3)),
    SeoSubscriber.Plan.BIANNUAL: ("SEO subscription, every six months", _every(6)),
    SeoSubscriber.Plan.ONEOFF: ("SEO audit", None),
}


def seo_quote_for_plan(plan) -> SeoQuote:
    details = SEO_PLAN_DETAILS.get(plan)
    if not details:
        raise PaymentConfigurationError("This SEO plan is unavailable.", code="invalid_plan")
    name, recurring = details
    site_settings = SiteSettings.load()
    price = site_settings.seo_subscription_price if recurring else site_settings.seo_oneoff_price
    return SeoQuote(plan=plan, name=name, price=price, recurring=recurring)


def accept_current_seo_offer(*, subscriber, user, accepted_ip, user_agent=""):
    quote = seo_quote_for_plan(subscriber.plan)
    try:
        agreement_version = publish_configured_agreement(
            SEO_AGREEMENT_KEY
        )
    except AgreementConfigurationError as error:
        raise PaymentConfigurationError(str(error)) from error
    acceptance = record_checkout_acceptance(
        agreement_version=agreement_version,
        accepted_by=user,
        related=subscriber,
        accepted_ip=accepted_ip,
        user_agent=user_agent,
        statement=seo_acceptance_statement(quote),
        context=seo_offer_context(subscriber, quote),
    )
    return acceptance, quote


def create_or_reuse_seo_checkout_session(subscriber, acceptance, quote):
    """Prepare the SEO checkout and return its client secret.

    One line item built from the recorded quote, so the agreed price and the
    charge cannot drift apart.
    """
    if subscriber.payment_status in {
        SeoSubscriber.PaymentStatus.ACTIVE, SeoSubscriber.PaymentStatus.PAID,
    }:
        raise PaymentConfigurationError("This SEO plan is already paid.", code="active")

    item = {"key": f"seo.{subscriber.plan}", "name": quote.name, "unit_amount": quote.price}
    if quote.recurring:
        item["recurring"] = quote.recurring
    items = [item]

    try:
        billing_customer = ensure_billing_customer(
            related=subscriber,
            email=subscriber.user.email,
            name=subscriber.business_name,
            label=subscriber.business_name,
            phone=subscriber.phone or "",
        )
        payment, client_secret = start_checkout(
            flow=SEO_SUBSCRIPTION if quote.recurring else SEO_ONEOFF,
            related=subscriber,
            related_label=subscriber.business_name,
            billing_customer=billing_customer,
            purpose=subscriber.plan,
            items=items,
            # See the note in services.py: not registered for GST.
            tax_mode="none",
            return_path="/seo/payment/complete",
            agreement_acceptance_id=str(acceptance.pk),
            # Non-sensitive, and the thing support looks for when
            # reading a Stripe object from the other end.
            reference=str(subscriber.pk),
        )
    except CheckoutError as error:
        raise PaymentConfigurationError(str(error), code=error.code) from error

    subscriber.stripe_customer_id = billing_customer.stripe_customer_id
    subscriber.save(update_fields=["stripe_customer_id", "updated_at"])
    return client_secret
