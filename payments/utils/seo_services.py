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
    one_off_addon: Decimal = Decimal("0")
    recurring_name: str | None = None
    currency: str = "aud"

    @property
    def unit_amount(self) -> int:
        return int((self.price * Decimal("100")).quantize(Decimal("1")))

    @property
    def mode(self) -> str:
        return "payment" if self.recurring is None else "subscription"

    @property
    def recurring_price(self) -> Decimal | None:
        if self.recurring is None:
            return None
        return self.price - self.one_off_addon


# field on SiteSettings, customer-facing name, Stripe recurring config (None = one-off)
SEO_PLAN_DETAILS = {
    SeoSubscriber.Plan.MONTHLY: ("seo_monthly_price", "Monthly SEO report", {"interval": "month", "interval_count": 1}),
    SeoSubscriber.Plan.QUARTERLY: ("seo_quarterly_price", "Quarterly SEO report", {"interval": "month", "interval_count": 3}),
    SeoSubscriber.Plan.BIANNUAL: ("seo_biannual_price", "Bi-annual SEO report", {"interval": "month", "interval_count": 6}),
    SeoSubscriber.Plan.ONEOFF: ("seo_oneoff_price", "One-off SEO report", None),
}


def seo_quote_for_plan(plan, report_type) -> SeoQuote:
    details = SEO_PLAN_DETAILS.get(plan)
    if not details:
        raise PaymentConfigurationError("This SEO plan is unavailable.", code="invalid_plan")
    field_name, seo_name, recurring = details
    site_settings = SiteSettings.load()
    seo_price = getattr(site_settings, field_name)
    gbp_price = site_settings.gbp_audit_price
    cadence = {
        SeoSubscriber.Plan.MONTHLY: "Monthly",
        SeoSubscriber.Plan.QUARTERLY: "Quarterly",
        SeoSubscriber.Plan.BIANNUAL: "Bi-annual",
        SeoSubscriber.Plan.ONEOFF: "One-off",
    }[plan]
    if report_type == SeoSubscriber.ReportType.GBP:
        if plan != SeoSubscriber.Plan.ONEOFF:
            raise PaymentConfigurationError(
                "The Google Business Profile audit is a one-time product.", code="invalid_plan"
            )
        name = "One-time Google Business Profile audit"
        price = gbp_price
        one_off_addon = Decimal("0")
        recurring_name = None
    elif report_type == SeoSubscriber.ReportType.SEO:
        name = seo_name
        price = seo_price
        one_off_addon = Decimal("0")
        recurring_name = seo_name if recurring else None
    elif report_type == SeoSubscriber.ReportType.BOTH:
        name = (
            f"{cadence} SEO report + one-time Google Business Profile audit"
            if recurring
            else "One-off SEO report + Google Business Profile audit"
        )
        price = seo_price + gbp_price
        one_off_addon = gbp_price if recurring else Decimal("0")
        recurring_name = seo_name if recurring else None
    else:
        raise PaymentConfigurationError("This report type is unavailable.", code="invalid_report_type")
    return SeoQuote(
        plan=plan,
        name=name,
        price=price,
        recurring=recurring,
        one_off_addon=one_off_addon,
        recurring_name=recurring_name,
    )


def accept_current_seo_offer(*, subscriber, user, accepted_ip, user_agent=""):
    quote = seo_quote_for_plan(subscriber.plan, subscriber.report_type)
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

    A recurring plan bought alongside a one-off audit is two line items,
    exactly as Stripe bills it, so the recorded quote and the charge cannot
    drift apart.
    """
    if subscriber.payment_status in {
        SeoSubscriber.PaymentStatus.ACTIVE, SeoSubscriber.PaymentStatus.PAID,
    }:
        raise PaymentConfigurationError("This SEO plan is already paid.", code="active")

    items = [{
        "key": f"seo.{subscriber.plan}",
        "name": quote.recurring_name or quote.name,
        "unit_amount": quote.recurring_price if quote.recurring else quote.price,
    }]
    if quote.recurring:
        items[0]["recurring"] = quote.recurring
    if quote.one_off_addon:
        items.append({
            "key": "seo.gbp_audit",
            "name": "One-time Google Business Profile audit",
            "unit_amount": quote.one_off_addon,
        })

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
