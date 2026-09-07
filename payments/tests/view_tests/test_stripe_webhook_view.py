from datetime import datetime, timezone
from unittest.mock import patch

import pytest
import stripe
from django.test import override_settings
from django.urls import reverse

from dealers.models import Dealer, DealerProfile
from dealers.tests.factories import DealerFactory
from payments.models import StripeEvent
from payments.tests.factories import DealerSubscriptionTermsAcceptanceFactory

pytestmark = pytest.mark.django_db

stripe_settings = override_settings(
    STRIPE_SECRET_KEY="sk_test_placeholder",
    STRIPE_WEBHOOK_SECRET="whsec_placeholder",
)


@pytest.fixture
def dealer():
    return DealerFactory(
        business_name="Example Motorcycles",
        contact_name="Alex Dealer",
        email="dealer@example.com",
        plan=Dealer.Plan.COMPLETE,
        payment_status=Dealer.PaymentStatus.PAYMENT_PENDING,
    )


@stripe_settings
@patch("payments.views.stripe_webhook.stripe.Webhook.construct_event")
def test_subscription_webhook_is_idempotent_and_activates_dealer(construct_event, client, dealer):
    acceptance = DealerSubscriptionTermsAcceptanceFactory(
        dealer=dealer, accepted_by=dealer.user, stripe_checkout_session_id="cs_test",
    )
    construct_event.return_value = {
        "id": "evt_active",
        "created": 1798761600,
        "type": "customer.subscription.updated",
        "data": {"object": {
            "id": "sub_test",
            "customer": "cus_test",
            "status": "active",
            "current_period_end": 1801440000,
            "cancel_at_period_end": False,
            "metadata": {
                "dealer_id": str(dealer.pk),
                "terms_acceptance_id": str(acceptance.pk),
            },
        }},
    }
    first = client.post(
        reverse("stripe-webhook"), data=b"{}", content_type="application/json",
        HTTP_STRIPE_SIGNATURE="test-signature",
    )
    second = client.post(
        reverse("stripe-webhook"), data=b"{}", content_type="application/json",
        HTTP_STRIPE_SIGNATURE="test-signature",
    )
    assert first.status_code == 200
    assert second.json()["outcome"] == "duplicate"
    dealer.refresh_from_db()
    assert dealer.payment_status == Dealer.PaymentStatus.ACTIVE
    assert dealer.stripe_subscription_id == "sub_test"
    assert DealerProfile.objects.filter(dealer=dealer).exists()
    assert StripeEvent.objects.count() == 1


@stripe_settings
@patch("payments.views.stripe_webhook.stripe.Webhook.construct_event")
def test_stale_subscription_event_cannot_regress_status(construct_event, client, dealer):
    acceptance = DealerSubscriptionTermsAcceptanceFactory(
        dealer=dealer, accepted_by=dealer.user, stripe_checkout_session_id="cs_test",
    )
    dealer.stripe_subscription_id = "sub_test"
    dealer.payment_status = Dealer.PaymentStatus.ACTIVE
    dealer.stripe_last_event_created_at = datetime.fromtimestamp(200, tz=timezone.utc)
    dealer.save()
    construct_event.return_value = {
        "id": "evt_stale",
        "created": 100,
        "type": "customer.subscription.updated",
        "data": {"object": {
            "id": "sub_test", "customer": "cus_test", "status": "past_due",
            "metadata": {"dealer_id": str(dealer.pk), "terms_acceptance_id": str(acceptance.pk)},
        }},
    }
    response = client.post(
        reverse("stripe-webhook"), data=b"{}", content_type="application/json",
        HTTP_STRIPE_SIGNATURE="test-signature",
    )
    assert response.json()["outcome"] == "ignored: stale subscription event"
    dealer.refresh_from_db()
    assert dealer.payment_status == Dealer.PaymentStatus.ACTIVE


@stripe_settings
@patch("payments.views.stripe_webhook.stripe.Webhook.construct_event")
def test_invalid_webhook_signature_is_rejected(construct_event, client, dealer):
    construct_event.side_effect = stripe.SignatureVerificationError("bad", "sig")
    response = client.post(
        reverse("stripe-webhook"), data=b"{}", content_type="application/json",
        HTTP_STRIPE_SIGNATURE="bad",
    )
    assert response.status_code == 400
