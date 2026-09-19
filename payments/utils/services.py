from dataclasses import dataclass
from decimal import Decimal

import stripe
from django.conf import settings

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
from .records import attach_session, billing_customer_for, record_payment


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

    billing_customer = billing_customer_for(
        related=dealer,
        email=dealer.user.email,
        name=dealer.business_name,
        phone=dealer.phone or "",
    )
    if not dealer.stripe_customer_id:
        dealer.stripe_customer_id = billing_customer.stripe_customer_id
        dealer.save(update_fields=["stripe_customer_id", "updated_at"])

    # Written before Stripe is called, so the session can carry its id and the
    # package's webhook handlers have something to find.
    payment = record_payment(
        flow=DEALER_SUBSCRIPTION,
        related=dealer,
        related_label=dealer.business_name,
        billing_customer=billing_customer,
        mode="subscription",
        purpose=dealer.plan,
        agreement_acceptance_id=acceptance.pk,
        items=[{
            "key": f"dealer.{dealer.plan}",
            "name": quote.name,
            "unit_amount": quote.monthly_price,
            "recurring": {"interval": "month"},
        }],
    )

    metadata = {
        "ftp_payment": str(payment.id),
        "dealer_id": str(dealer.pk),
        "plan": dealer.plan,
        "terms_acceptance_id": str(acceptance.pk),
        "terms_sha256": acceptance.agreement_version.content_sha256,
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
                "recurring": {"interval": "month"},
                "product_data": {"name": quote.name},
            },
            "quantity": 1,
        }],
        # No automatic_tax and no tax_behavior: the entity taking these
        # payments is not registered for GST, so there is none to calculate or
        # to describe the price as containing. See _docs/stripe-subscriptions.md.
        return_url=return_url,
        client_reference_id=str(dealer.pk),
        metadata=metadata,
        subscription_data={"metadata": metadata},
        idempotency_key=f"dealer-{dealer.pk}-subscription-{payment.id}",
    )
    if not session.client_secret:
        raise PaymentConfigurationError("Stripe did not return a checkout session.")

    attach_session(payment, session.id)
    dealer.stripe_checkout_session_id = session.id
    dealer.save(update_fields=["stripe_checkout_session_id", "updated_at"])
    return session.client_secret
