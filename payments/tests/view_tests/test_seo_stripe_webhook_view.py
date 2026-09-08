from unittest.mock import patch

import pytest
from django.urls import reverse

from dealers.models import Dealer
from payments.models import StripeEvent
from payments.tests.conftest import stripe_settings
from payments.tests.factories import (
    DealerSubscriptionTermsAcceptanceFactory,
    SeoSubscriptionTermsAcceptanceFactory,
)
from seo.models import SeoProfile, SeoSubscriber

pytestmark = pytest.mark.django_db


@stripe_settings
@patch("payments.views.stripe_webhook.stripe.Webhook.construct_event")
def test_subscription_webhook_activates_seo_subscriber(construct_event, client, seo_subscriber):
    acceptance = SeoSubscriptionTermsAcceptanceFactory(
        subscriber=seo_subscriber, accepted_by=seo_subscriber.user,
        stripe_checkout_session_id="cs_test",
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
                "subscriber_id": str(seo_subscriber.pk),
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
    seo_subscriber.refresh_from_db()
    assert seo_subscriber.payment_status == SeoSubscriber.PaymentStatus.ACTIVE
    assert seo_subscriber.stripe_subscription_id == "sub_test"
    assert SeoProfile.objects.filter(subscriber=seo_subscriber).exists()
    assert StripeEvent.objects.count() == 1


@stripe_settings
@patch("payments.views.stripe_webhook.stripe.Webhook.construct_event")
def test_one_off_checkout_completed_marks_paid(construct_event, client, seo_subscriber):
    seo_subscriber.plan = SeoSubscriber.Plan.ONEOFF
    seo_subscriber.stripe_checkout_session_id = "cs_oneoff"
    seo_subscriber.save(update_fields=["plan", "stripe_checkout_session_id"])
    acceptance = SeoSubscriptionTermsAcceptanceFactory(
        subscriber=seo_subscriber, accepted_by=seo_subscriber.user,
        plan=SeoSubscriber.Plan.ONEOFF, stripe_checkout_session_id="cs_oneoff",
    )
    construct_event.return_value = {
        "id": "evt_oneoff",
        "created": 1798761600,
        "type": "checkout.session.completed",
        "data": {"object": {
            "id": "cs_oneoff",
            "mode": "payment",
            "customer": "cus_test",
            "payment_intent": "pi_test",
            "metadata": {
                "subscriber_id": str(seo_subscriber.pk),
                "terms_acceptance_id": str(acceptance.pk),
            },
        }},
    }
    response = client.post(
        reverse("stripe-webhook"), data=b"{}", content_type="application/json",
        HTTP_STRIPE_SIGNATURE="test-signature",
    )
    assert response.status_code == 200
    seo_subscriber.refresh_from_db()
    assert seo_subscriber.payment_status == SeoSubscriber.PaymentStatus.PAID
    assert seo_subscriber.stripe_payment_intent_id == "pi_test"
    assert seo_subscriber.stripe_subscription_id is None
    assert SeoProfile.objects.filter(subscriber=seo_subscriber).exists()


@stripe_settings
@patch("payments.views.stripe_webhook.stripe.Webhook.construct_event")
def test_dealer_subscription_event_still_routes_to_dealer_handler(construct_event, client, dealer):
    acceptance = DealerSubscriptionTermsAcceptanceFactory(
        dealer=dealer, accepted_by=dealer.user, stripe_checkout_session_id="cs_test",
    )
    construct_event.return_value = {
        "id": "evt_dealer",
        "created": 1798761600,
        "type": "customer.subscription.updated",
        "data": {"object": {
            "id": "sub_dealer",
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
    response = client.post(
        reverse("stripe-webhook"), data=b"{}", content_type="application/json",
        HTTP_STRIPE_SIGNATURE="test-signature",
    )
    assert response.status_code == 200
    dealer.refresh_from_db()
    assert dealer.payment_status == Dealer.PaymentStatus.ACTIVE
    assert not SeoSubscriber.objects.filter(stripe_subscription_id="sub_dealer").exists()
