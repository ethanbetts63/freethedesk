"""SEO checkout: quoting, agreement acceptance, and the Stripe session.

Webhook handling moved to ``freetheplatform.payments``; what happens once an
SEO payment succeeds is in ``payments/flows.py``.
"""

from dataclasses import dataclass
from decimal import Decimal

import stripe
from django.conf import settings

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
from .records import attach_session, billing_customer_for, record_payment
from .services import PaymentConfigurationError, _session_matches_acceptance, _value


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
    if subscriber.payment_status in {
        SeoSubscriber.PaymentStatus.ACTIVE, SeoSubscriber.PaymentStatus.PAID,
    }:
        raise PaymentConfigurationError("This SEO plan is already paid.", code="active")
    if not settings.STRIPE_SECRET_KEY:
        raise PaymentConfigurationError("Stripe payments are not configured yet.")

    stripe.api_key = settings.STRIPE_SECRET_KEY
    prior_session_id = subscriber.stripe_checkout_session_id
    if prior_session_id:
        try:
            existing = stripe.checkout.Session.retrieve(prior_session_id)
            if _value(existing, "status") == "open" and _session_matches_acceptance(existing, acceptance):
                if _value(existing, "client_secret"):
                    return _value(existing, "client_secret")
            elif _value(existing, "status") == "open":
                stripe.checkout.Session.expire(prior_session_id)
            elif _value(existing, "status") == "complete":
                raise PaymentConfigurationError("Your payment is being confirmed.", code="confirmed")
        except PaymentConfigurationError:
            raise
        except stripe.InvalidRequestError:
            pass

    billing_customer = billing_customer_for(
        related=subscriber,
        email=subscriber.user.email,
        name=subscriber.business_name,
        phone=subscriber.phone or "",
    )
    if not subscriber.stripe_customer_id:
        subscriber.stripe_customer_id = billing_customer.stripe_customer_id
        subscriber.save(update_fields=["stripe_customer_id", "updated_at"])

    recurring_unit_amount = (
        int((quote.recurring_price * Decimal("100")).quantize(Decimal("1")))
        if quote.recurring_price is not None
        else None
    )

    # The shared record, written before Stripe is called. A recurring plan
    # bought with a one-off audit is two lines, exactly as Stripe sees it, so
    # the quote and the charge cannot drift apart.
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

    payment = record_payment(
        flow=SEO_SUBSCRIPTION if quote.recurring else SEO_ONEOFF,
        related=subscriber,
        related_label=subscriber.business_name,
        billing_customer=billing_customer,
        mode=quote.mode,
        purpose=subscriber.plan,
        agreement_acceptance_id=acceptance.pk,
        items=items,
    )

    metadata = {
        "ftp_payment": str(payment.id),
        "subscriber_id": str(subscriber.pk),
        "plan": subscriber.plan,
        "report_type": subscriber.report_type,
        "terms_acceptance_id": str(acceptance.pk),
        "terms_sha256": acceptance.agreement_version.content_sha256,
        "price_cents": str(quote.unit_amount),
        "currency": quote.currency,
    }
    return_url = f"{settings.SITE_URL.rstrip('/')}/seo/payment/complete"
    price_data = {
        "currency": quote.currency,
        "unit_amount": recurring_unit_amount if recurring_unit_amount is not None else quote.unit_amount,
        "product_data": {"name": quote.recurring_name or quote.name},
    }
    session_args = {
        "ui_mode": "elements",
        "mode": quote.mode,
        "customer": subscriber.stripe_customer_id,
        "line_items": [{"price_data": price_data, "quantity": 1}],
        # No automatic_tax and no tax_behavior: not registered for GST.
        # See _docs/stripe-subscriptions.md.
        "return_url": return_url,
        "client_reference_id": str(subscriber.pk),
        "metadata": metadata,
        "idempotency_key": f"seo-{subscriber.pk}-{quote.mode}-{payment.id}",
    }
    if quote.recurring is None:
        session_args["payment_intent_data"] = {"metadata": metadata}
    else:
        price_data["recurring"] = quote.recurring
        session_args["subscription_data"] = {"metadata": metadata}
        if quote.one_off_addon:
            session_args["line_items"].append({
                "price_data": {
                    "currency": quote.currency,
                    "unit_amount": int((quote.one_off_addon * Decimal("100")).quantize(Decimal("1"))),
                    "product_data": {"name": "One-time Google Business Profile audit"},
                },
                "quantity": 1,
            })

    session = stripe.checkout.Session.create(**session_args)
    if not session.client_secret:
        raise PaymentConfigurationError("Stripe did not return a checkout session.")

    attach_session(payment, session.id)
    subscriber.stripe_checkout_session_id = session.id
    subscriber.save(update_fields=["stripe_checkout_session_id", "updated_at"])
    return session.client_secret
