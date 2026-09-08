"""SEO subscription checkout + webhook handling.

Parallel to ``payments.utils.services`` (the dealer flow), kept separate so the
working dealer code is untouched. ``process_stripe_event`` in ``services`` does a
deferred import of the handlers here and dispatches by Stripe metadata.
"""

from dataclasses import dataclass
from decimal import Decimal
from hashlib import sha256

import stripe
from django.conf import settings

from core.models import SiteSettings
from seo.models import SeoSubscriber
from seo.utils.services import ensure_seo_profile

from ..models import SeoSubscriptionTermsAcceptance
from .services import (
    PaymentConfigurationError,
    _period_end,
    _session_matches_acceptance,
    _subscription_id,
    _value,
)


@dataclass(frozen=True)
class SeoQuote:
    plan: str
    name: str
    price: Decimal
    recurring: dict | None
    currency: str = "aud"

    @property
    def unit_amount(self) -> int:
        return int((self.price * Decimal("100")).quantize(Decimal("1")))

    @property
    def mode(self) -> str:
        return "payment" if self.recurring is None else "subscription"


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
        name = f"{cadence} Google Business Profile report"
        price = gbp_price
    elif report_type == SeoSubscriber.ReportType.SEO:
        name = seo_name
        price = seo_price
    elif report_type == SeoSubscriber.ReportType.BOTH:
        name = f"{cadence} Google Business Profile + SEO report"
        price = seo_price + gbp_price
    else:
        raise PaymentConfigurationError("This report type is unavailable.", code="invalid_report_type")
    return SeoQuote(plan=plan, name=name, price=price, recurring=recurring)


def current_seo_terms_sha256() -> str:
    try:
        return sha256(settings.SEO_TERMS_FILE.read_bytes()).hexdigest()
    except OSError as error:
        raise PaymentConfigurationError("SEO reporting and audit terms are not configured.") from error


def accept_current_seo_offer(*, subscriber, user, accepted_ip):
    quote = seo_quote_for_plan(subscriber.plan, subscriber.report_type)
    terms_hash = current_seo_terms_sha256()
    acceptance, _ = SeoSubscriptionTermsAcceptance.objects.get_or_create(
        subscriber=subscriber,
        plan=subscriber.plan,
        report_type=subscriber.report_type,
        price=quote.price,
        currency=quote.currency.upper(),
        terms_version=settings.SEO_TERMS_VERSION,
        terms_sha256=terms_hash,
        defaults={
            "accepted_by": user,
            "accepted_ip": accepted_ip,
        },
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

    if not subscriber.stripe_customer_id:
        customer_data = {
            "email": subscriber.user.email,
            "name": subscriber.business_name,
            "metadata": {"subscriber_id": str(subscriber.pk)},
        }
        if subscriber.phone:
            customer_data["phone"] = subscriber.phone
        customer = stripe.Customer.create(
            **customer_data,
            idempotency_key=f"seo-{subscriber.pk}-customer-v1",
        )
        subscriber.stripe_customer_id = customer.id
        subscriber.save(update_fields=["stripe_customer_id", "updated_at"])

    metadata = {
        "subscriber_id": str(subscriber.pk),
        "plan": subscriber.plan,
        "report_type": subscriber.report_type,
        "terms_acceptance_id": str(acceptance.pk),
        "terms_sha256": acceptance.terms_sha256,
        "price_cents": str(quote.unit_amount),
        "currency": quote.currency,
    }
    return_url = f"{settings.SITE_URL.rstrip('/')}/seo/payment/complete"
    price_data = {
        "currency": quote.currency,
        "unit_amount": quote.unit_amount,
        "tax_behavior": "inclusive",
        "product_data": {"name": quote.name},
    }
    session_args = {
        "ui_mode": "elements",
        "mode": quote.mode,
        "customer": subscriber.stripe_customer_id,
        "line_items": [{"price_data": price_data, "quantity": 1}],
        "billing_address_collection": "required",
        "customer_update": {"address": "auto"},
        "automatic_tax": {"enabled": True},
        "return_url": return_url,
        "client_reference_id": str(subscriber.pk),
        "metadata": metadata,
        "idempotency_key": (
            f"seo-{subscriber.pk}-{quote.mode}-{acceptance.pk}-"
            f"after-{prior_session_id or 'initial'}"
        ),
    }
    if quote.recurring is None:
        session_args["payment_intent_data"] = {"metadata": metadata}
    else:
        price_data["recurring"] = quote.recurring
        session_args["subscription_data"] = {"metadata": metadata}

    session = stripe.checkout.Session.create(**session_args)
    if not session.client_secret:
        raise PaymentConfigurationError("Stripe did not return a checkout session.")

    subscriber.stripe_checkout_session_id = session.id
    subscriber.save(update_fields=["stripe_checkout_session_id", "updated_at"])
    acceptance.stripe_checkout_session_id = session.id
    acceptance.save(update_fields=["stripe_checkout_session_id"])
    return session.client_secret


def stripe_object_is_seo(obj) -> bool:
    """True if this Stripe object belongs to the SEO flow rather than the dealer flow."""
    metadata = _value(obj, "metadata", {}) or {}
    if _value(metadata, "subscriber_id"):
        return True
    if _value(metadata, "dealer_id"):
        return False
    candidate = _subscription_id(obj) or _value(obj, "id")
    return bool(candidate) and SeoSubscriber.objects.filter(
        stripe_subscription_id=candidate
    ).exists()


def _seo_subscriber_for_stripe_object(obj):
    metadata = _value(obj, "metadata", {}) or {}
    subscriber_id = _value(metadata, "subscriber_id")
    if subscriber_id:
        return SeoSubscriber.objects.filter(pk=subscriber_id).first()
    subscription_id = _subscription_id(obj) or _value(obj, "id")
    if subscription_id:
        return SeoSubscriber.objects.filter(stripe_subscription_id=subscription_id).first()
    return None


def _acceptance_for_seo_object(obj, subscriber):
    metadata = _value(obj, "metadata", {}) or {}
    acceptance_id = _value(metadata, "terms_acceptance_id")
    if not acceptance_id:
        return None
    return SeoSubscriptionTermsAcceptance.objects.filter(pk=acceptance_id, subscriber=subscriber).first()


def _payment_status_for_seo_subscription(stripe_status):
    if stripe_status in {"active", "trialing"}:
        return SeoSubscriber.PaymentStatus.ACTIVE
    if stripe_status in {"past_due", "unpaid"}:
        return SeoSubscriber.PaymentStatus.PAST_DUE
    if stripe_status in {"canceled", "paused"}:
        return SeoSubscriber.PaymentStatus.CANCELLED
    return SeoSubscriber.PaymentStatus.PAYMENT_PENDING


def handle_seo_checkout_session_completed(session):
    subscriber = _seo_subscriber_for_stripe_object(session)
    if not subscriber:
        return "ignored: seo subscriber not found"
    subscriber = SeoSubscriber.objects.select_for_update().get(pk=subscriber.pk)
    if _value(session, "id") != subscriber.stripe_checkout_session_id:
        return "ignored: superseded checkout session"
    if not _acceptance_for_seo_object(session, subscriber):
        return "ignored: terms acceptance not found"

    subscriber.stripe_customer_id = _value(session, "customer") or subscriber.stripe_customer_id

    if _value(session, "mode") == "payment" or subscriber.is_one_off:
        # One-off products have no subscription event, so this is authoritative.
        subscriber.stripe_payment_intent_id = (
            _value(session, "payment_intent") or subscriber.stripe_payment_intent_id
        )
        subscriber.payment_status = SeoSubscriber.PaymentStatus.PAID
        subscriber.subscription_current_period_end = None
        subscriber.save(update_fields=[
            "stripe_customer_id", "stripe_payment_intent_id", "payment_status",
            "subscription_current_period_end", "updated_at",
        ])
        ensure_seo_profile(subscriber)
        return "one-off payment recorded"

    subscriber.stripe_subscription_id = (
        _value(session, "subscription") or subscriber.stripe_subscription_id
    )
    subscriber.save(update_fields=[
        "stripe_customer_id", "stripe_subscription_id", "updated_at",
    ])
    return "checkout recorded"


def handle_seo_subscription_changed(subscription, event_created):
    subscriber = _seo_subscriber_for_stripe_object(subscription)
    if not subscriber:
        return "ignored: seo subscriber not found"
    subscriber = SeoSubscriber.objects.select_for_update().get(pk=subscriber.pk)
    subscription_id = _value(subscription, "id")
    if subscriber.stripe_subscription_id and subscription_id != subscriber.stripe_subscription_id:
        return "ignored: superseded subscription"
    if subscriber.stripe_last_event_created_at and event_created < subscriber.stripe_last_event_created_at:
        return "ignored: stale subscription event"
    if not _acceptance_for_seo_object(subscription, subscriber):
        return "ignored: terms acceptance not found"

    subscriber.stripe_subscription_id = subscription_id
    subscriber.stripe_customer_id = _value(subscription, "customer") or subscriber.stripe_customer_id
    subscriber.payment_status = _payment_status_for_seo_subscription(_value(subscription, "status", ""))
    subscriber.subscription_current_period_end = _period_end(subscription)
    subscriber.cancel_at_period_end = bool(_value(subscription, "cancel_at_period_end", False))
    subscriber.stripe_last_event_created_at = event_created
    subscriber.save(update_fields=[
        "stripe_subscription_id", "stripe_customer_id", "payment_status",
        "subscription_current_period_end", "cancel_at_period_end",
        "stripe_last_event_created_at", "updated_at",
    ])
    if subscriber.payment_status == SeoSubscriber.PaymentStatus.ACTIVE:
        ensure_seo_profile(subscriber)
    return f"subscription {subscriber.payment_status}"
