from dataclasses import dataclass
from datetime import datetime, timezone as datetime_timezone
from decimal import Decimal
from hashlib import sha256

import stripe
from django.conf import settings
from django.db import transaction

from core.models import LicensingSettings
from dealers.models import Dealer
from dealers.services import ensure_dealer_profile

from .models import DealerSubscriptionTermsAcceptance, StripeEvent


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
        raise PaymentConfigurationError("The demo plan does not require payment.", code="demo")
    field_name, name = details
    price = getattr(LicensingSettings.load(), field_name)
    return SubscriptionQuote(plan=plan, name=name, monthly_price=price)


def current_terms_sha256():
    try:
        return sha256(settings.DEALER_TERMS_FILE.read_bytes()).hexdigest()
    except OSError as error:
        raise PaymentConfigurationError("Dealer subscription terms are not configured.") from error


def accept_current_offer(*, dealer, user, accepted_ip):
    quote = quote_for_plan(dealer.plan)
    terms_hash = current_terms_sha256()
    acceptance, _ = DealerSubscriptionTermsAcceptance.objects.get_or_create(
        dealer=dealer,
        plan=dealer.plan,
        monthly_price=quote.monthly_price,
        currency=quote.currency.upper(),
        terms_sha256=terms_hash,
        defaults={
            "accepted_by": user,
            "accepted_ip": accepted_ip,
            "terms_version": settings.DEALER_TERMS_VERSION,
        },
    )
    return acceptance, quote


def _value(obj, key, default=None):
    if obj is None:
        return default
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


def _session_matches_acceptance(session, acceptance):
    metadata = _value(session, "metadata", {}) or {}
    return str(_value(metadata, "terms_acceptance_id", "")) == str(acceptance.pk)


def create_or_reuse_checkout_session(dealer, acceptance, quote):
    if dealer.payment_status == Dealer.PaymentStatus.ACTIVE:
        raise PaymentConfigurationError("This subscription is already active.", code="active")
    if not settings.STRIPE_SECRET_KEY:
        raise PaymentConfigurationError("Stripe payments are not configured yet.")

    stripe.api_key = settings.STRIPE_SECRET_KEY
    prior_session_id = dealer.stripe_checkout_session_id
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

    if not dealer.stripe_customer_id:
        customer_data = {
            "email": dealer.email,
            "name": dealer.business_name,
            "metadata": {"dealer_id": str(dealer.pk)},
        }
        if dealer.phone:
            customer_data["phone"] = dealer.phone
        customer = stripe.Customer.create(
            **customer_data,
            idempotency_key=f"dealer-{dealer.pk}-customer-v1",
        )
        dealer.stripe_customer_id = customer.id
        dealer.save(update_fields=["stripe_customer_id", "updated_at"])

    metadata = {
        "dealer_id": str(dealer.pk),
        "plan": dealer.plan,
        "terms_acceptance_id": str(acceptance.pk),
        "terms_sha256": acceptance.terms_sha256,
        "price_cents": str(quote.unit_amount),
        "currency": quote.currency,
    }
    return_url = f"{settings.SITE_URL.rstrip('/')}/licensing/payment/complete"
    session = stripe.checkout.Session.create(
        ui_mode="elements",
        mode="subscription",
        customer=dealer.stripe_customer_id,
        line_items=[{
            "price_data": {
                "currency": quote.currency,
                "unit_amount": quote.unit_amount,
                "tax_behavior": "inclusive",
                "recurring": {"interval": "month"},
                "product_data": {"name": quote.name},
            },
            "quantity": 1,
        }],
        billing_address_collection="required",
        automatic_tax={"enabled": True},
        return_url=return_url,
        client_reference_id=str(dealer.pk),
        metadata=metadata,
        subscription_data={"metadata": metadata},
        idempotency_key=(
            f"dealer-{dealer.pk}-subscription-{acceptance.pk}-"
            f"after-{prior_session_id or 'initial'}"
        ),
    )
    if not session.client_secret:
        raise PaymentConfigurationError("Stripe did not return a checkout session.")

    dealer.stripe_checkout_session_id = session.id
    dealer.save(update_fields=["stripe_checkout_session_id", "updated_at"])
    acceptance.stripe_checkout_session_id = session.id
    acceptance.save(update_fields=["stripe_checkout_session_id"])
    return session.client_secret


def _subscription_id(obj):
    subscription = _value(obj, "subscription")
    if subscription:
        return _value(subscription, "id", subscription)
    parent = _value(obj, "parent", {}) or {}
    details = _value(parent, "subscription_details", {}) or {}
    subscription = _value(details, "subscription")
    return _value(subscription, "id", subscription)


def _dealer_for_stripe_object(obj):
    metadata = _value(obj, "metadata", {}) or {}
    dealer_id = _value(metadata, "dealer_id")
    if dealer_id:
        return Dealer.objects.filter(pk=dealer_id).first()
    subscription_id = _subscription_id(obj)
    if subscription_id:
        return Dealer.objects.filter(stripe_subscription_id=subscription_id).first()
    return None


def _acceptance_for_object(obj, dealer):
    metadata = _value(obj, "metadata", {}) or {}
    acceptance_id = _value(metadata, "terms_acceptance_id")
    if not acceptance_id:
        return None
    return DealerSubscriptionTermsAcceptance.objects.filter(pk=acceptance_id, dealer=dealer).first()


def _period_end(subscription):
    timestamp = _value(subscription, "current_period_end")
    if not timestamp:
        items = _value(_value(subscription, "items", {}), "data", []) or []
        timestamp = _value(items[0], "current_period_end") if items else None
    return datetime.fromtimestamp(timestamp, tz=datetime_timezone.utc) if timestamp else None


def _payment_status_for_subscription(stripe_status):
    if stripe_status in {"active", "trialing"}:
        return Dealer.PaymentStatus.ACTIVE
    if stripe_status in {"past_due", "unpaid"}:
        return Dealer.PaymentStatus.PAST_DUE
    if stripe_status in {"canceled", "paused"}:
        return Dealer.PaymentStatus.CANCELLED
    return Dealer.PaymentStatus.PAYMENT_PENDING


def _event_datetime(timestamp):
    return datetime.fromtimestamp(timestamp, tz=datetime_timezone.utc)


def handle_checkout_session_completed(session):
    dealer = _dealer_for_stripe_object(session)
    if not dealer:
        return "ignored: dealer not found"
    dealer = Dealer.objects.select_for_update().get(pk=dealer.pk)
    if _value(session, "id") != dealer.stripe_checkout_session_id:
        return "ignored: superseded checkout session"
    if not _acceptance_for_object(session, dealer):
        return "ignored: terms acceptance not found"
    dealer.stripe_customer_id = _value(session, "customer") or dealer.stripe_customer_id
    dealer.stripe_subscription_id = _value(session, "subscription") or dealer.stripe_subscription_id
    dealer.save(update_fields=["stripe_customer_id", "stripe_subscription_id", "updated_at"])
    return "checkout recorded"


def handle_subscription_changed(subscription, event_created):
    dealer = _dealer_for_stripe_object(subscription)
    if not dealer:
        return "ignored: dealer not found"
    dealer = Dealer.objects.select_for_update().get(pk=dealer.pk)
    subscription_id = _value(subscription, "id")
    if dealer.stripe_subscription_id and subscription_id != dealer.stripe_subscription_id:
        return "ignored: superseded subscription"
    if dealer.stripe_last_event_created_at and event_created < dealer.stripe_last_event_created_at:
        return "ignored: stale subscription event"
    if not _acceptance_for_object(subscription, dealer):
        return "ignored: terms acceptance not found"

    dealer.stripe_subscription_id = subscription_id
    dealer.stripe_customer_id = _value(subscription, "customer") or dealer.stripe_customer_id
    dealer.payment_status = _payment_status_for_subscription(_value(subscription, "status", ""))
    dealer.subscription_current_period_end = _period_end(subscription)
    dealer.cancel_at_period_end = bool(_value(subscription, "cancel_at_period_end", False))
    dealer.stripe_last_event_created_at = event_created
    dealer.save(update_fields=[
        "stripe_subscription_id", "stripe_customer_id", "payment_status",
        "subscription_current_period_end", "cancel_at_period_end",
        "stripe_last_event_created_at", "updated_at",
    ])
    if dealer.payment_status == Dealer.PaymentStatus.ACTIVE:
        ensure_dealer_profile(dealer)
    return f"subscription {dealer.payment_status}"


@transaction.atomic
def process_stripe_event(event):
    event_id = _value(event, "id")
    event_type = _value(event, "type", "")
    created_timestamp = _value(event, "created")
    if not event_id or not event_type or not created_timestamp:
        raise ValueError("Incomplete Stripe event.")
    stripe_object = _value(_value(event, "data", {}), "object", {})
    record, created = StripeEvent.objects.get_or_create(
        event_id=event_id,
        defaults={
            "event_type": event_type,
            "object_id": str(_value(stripe_object, "id", "")),
            "stripe_created_at": _event_datetime(created_timestamp),
        },
    )
    if not created:
        return "duplicate"

    if event_type == "checkout.session.completed":
        outcome = handle_checkout_session_completed(stripe_object)
    elif event_type in {
        "customer.subscription.created", "customer.subscription.updated",
        "customer.subscription.deleted",
    }:
        outcome = handle_subscription_changed(stripe_object, record.stripe_created_at)
    elif event_type in {"invoice.paid", "invoice.payment_failed"}:
        outcome = "invoice recorded; subscription event remains authoritative"
    else:
        outcome = "ignored: unsupported event"
    record.outcome = outcome
    record.save(update_fields=["outcome"])
    return outcome
