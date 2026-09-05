from datetime import datetime, timezone as datetime_timezone

import stripe
from django.conf import settings
from django.db import transaction

from dealers.models import Dealer, DealerProfile


class PaymentConfigurationError(Exception):
    """A safe error that can be shown while preparing checkout."""


PLAN_PRICE_SETTINGS = {
    Dealer.Plan.LICENSING: "STRIPE_PRICE_LICENSING",
    Dealer.Plan.CONTRACTS: "STRIPE_PRICE_CONTRACTS",
    Dealer.Plan.COMPLETE: "STRIPE_PRICE_COMPLETE",
}


def ensure_dealer_profile(dealer: Dealer) -> DealerProfile:
    profile, _ = DealerProfile.objects.get_or_create(
        dealer=dealer,
        defaults={"trading_name": dealer.business_name, "state": dealer.state, "phone": dealer.phone, "email": dealer.email},
    )
    return profile


def _value(obj, key, default=None):
    if obj is None:
        return default
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


def _price_for_plan(plan: str) -> str:
    setting_name = PLAN_PRICE_SETTINGS.get(plan)
    price_id = getattr(settings, setting_name, "") if setting_name else ""
    if not price_id:
        raise PaymentConfigurationError("Payments for this plan are not configured yet.")
    return price_id


def create_or_reuse_checkout_session(dealer: Dealer) -> str:
    if dealer.plan == Dealer.Plan.DEMO:
        raise PaymentConfigurationError("The demo plan does not require payment.")
    if dealer.payment_status == Dealer.PaymentStatus.ACTIVE:
        raise PaymentConfigurationError("This subscription is already active.")
    if not settings.STRIPE_SECRET_KEY:
        raise PaymentConfigurationError("Stripe payments are not configured yet.")

    stripe.api_key = settings.STRIPE_SECRET_KEY
    if dealer.stripe_checkout_session_id:
        try:
            existing = stripe.checkout.Session.retrieve(dealer.stripe_checkout_session_id)
            if _value(existing, "status") == "open" and _value(existing, "client_secret"):
                return existing.client_secret
            if _value(existing, "status") == "complete":
                raise PaymentConfigurationError("Your payment is being confirmed.")
        except PaymentConfigurationError:
            raise
        except Exception:
            # An expired or unavailable session is safe to replace. Stripe still
            # prevents a completed session from being confirmed twice.
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
        )
        dealer.stripe_customer_id = customer.id

    price_id = _price_for_plan(dealer.plan)
    return_url = f"{settings.SITE_URL.rstrip('/')}/licensing/payment/complete"
    session = stripe.checkout.Session.create(
        ui_mode="elements",
        mode="subscription",
        customer=dealer.stripe_customer_id,
        line_items=[{"price": price_id, "quantity": 1}],
        billing_address_collection="required",
        automatic_tax={"enabled": True},
        return_url=return_url,
        client_reference_id=str(dealer.pk),
        metadata={"dealer_id": str(dealer.pk), "plan": dealer.plan},
        subscription_data={"metadata": {"dealer_id": str(dealer.pk), "plan": dealer.plan}},
    )
    if not session.client_secret:
        raise PaymentConfigurationError("Stripe did not return a checkout session.")

    dealer.stripe_checkout_session_id = session.id
    dealer.save(update_fields=["stripe_customer_id", "stripe_checkout_session_id", "updated_at"])
    return session.client_secret


def _dealer_for_stripe_object(obj):
    metadata = _value(obj, "metadata", {}) or {}
    dealer_id = _value(metadata, "dealer_id")
    if dealer_id:
        return Dealer.objects.filter(pk=dealer_id).first()
    subscription_id = _value(obj, "subscription")
    if subscription_id:
        dealer = Dealer.objects.filter(stripe_subscription_id=subscription_id).first()
        if dealer:
            return dealer
    customer_id = _value(obj, "customer")
    if customer_id:
        return Dealer.objects.filter(stripe_customer_id=customer_id).first()
    return None


def _period_end(subscription):
    timestamp = _value(subscription, "current_period_end")
    if not timestamp:
        items = _value(_value(subscription, "items", {}), "data", []) or []
        timestamp = _value(items[0], "current_period_end") if items else None
    return datetime.fromtimestamp(timestamp, tz=datetime_timezone.utc) if timestamp else None


def _payment_status_for_subscription(stripe_status: str) -> str:
    if stripe_status in {"active", "trialing"}:
        return Dealer.PaymentStatus.ACTIVE
    if stripe_status in {"past_due", "unpaid"}:
        return Dealer.PaymentStatus.PAST_DUE
    if stripe_status in {"canceled", "paused"}:
        return Dealer.PaymentStatus.CANCELLED
    return Dealer.PaymentStatus.PAYMENT_PENDING


@transaction.atomic
def handle_checkout_session_completed(session) -> None:
    dealer = _dealer_for_stripe_object(session)
    if not dealer:
        return
    dealer = Dealer.objects.select_for_update().get(pk=dealer.pk)
    dealer.stripe_checkout_session_id = _value(session, "id") or dealer.stripe_checkout_session_id
    dealer.stripe_customer_id = _value(session, "customer") or dealer.stripe_customer_id
    dealer.stripe_subscription_id = _value(session, "subscription") or dealer.stripe_subscription_id
    dealer.save(update_fields=[
        "stripe_checkout_session_id", "stripe_customer_id", "stripe_subscription_id", "updated_at",
    ])


@transaction.atomic
def handle_subscription_changed(subscription) -> None:
    dealer = _dealer_for_stripe_object(subscription)
    if not dealer:
        return
    dealer = Dealer.objects.select_for_update().get(pk=dealer.pk)
    dealer.stripe_subscription_id = _value(subscription, "id") or dealer.stripe_subscription_id
    dealer.stripe_customer_id = _value(subscription, "customer") or dealer.stripe_customer_id
    dealer.payment_status = _payment_status_for_subscription(_value(subscription, "status", ""))
    dealer.subscription_current_period_end = _period_end(subscription)
    dealer.cancel_at_period_end = bool(_value(subscription, "cancel_at_period_end", False))
    dealer.save(update_fields=[
        "stripe_subscription_id", "stripe_customer_id", "payment_status",
        "subscription_current_period_end", "cancel_at_period_end", "updated_at",
    ])
    if dealer.payment_status == Dealer.PaymentStatus.ACTIVE:
        ensure_dealer_profile(dealer)


@transaction.atomic
def handle_invoice_payment(invoice, *, succeeded: bool) -> None:
    dealer = _dealer_for_stripe_object(invoice)
    if not dealer:
        return
    dealer = Dealer.objects.select_for_update().get(pk=dealer.pk)
    dealer.payment_status = (
        Dealer.PaymentStatus.ACTIVE if succeeded else Dealer.PaymentStatus.PAST_DUE
    )
    dealer.save(update_fields=["payment_status", "updated_at"])
    if succeeded:
        ensure_dealer_profile(dealer)
