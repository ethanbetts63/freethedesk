from decimal import Decimal
from unittest.mock import Mock, patch

import pytest
from django.test import override_settings
from django.urls import reverse

from core.models import SiteSettings
from dealers.models import Dealer
from dealers.tests.factories import DealerFactory
from payments.models import DealerSubscriptionTermsAcceptance

pytestmark = pytest.mark.django_db

stripe_settings = override_settings(
    STRIPE_SECRET_KEY="sk_test_placeholder",
    STRIPE_WEBHOOK_SECRET="whsec_placeholder",
)


@pytest.fixture
def dealer(client):
    dealer = DealerFactory(
        business_name="Example Motorcycles",
        contact_name="Alex Dealer",
        email="dealer@example.com",
        plan=Dealer.Plan.COMPLETE,
        payment_status=Dealer.PaymentStatus.PAYMENT_PENDING,
    )
    client.force_login(dealer.user)
    return dealer


@stripe_settings
@patch("payments.utils.services.stripe.checkout.Session.create")
@patch("payments.utils.services.stripe.Customer.create")
def test_checkout_uses_backend_price_and_records_terms(customer_create, session_create, client, dealer):
    SiteSettings.load()
    settings = SiteSettings.load()
    settings.complete_price = Decimal("219.50")
    settings.save()
    customer_create.return_value = Mock(id="cus_test")
    session_create.return_value = Mock(id="cs_test", client_secret="cs_test_secret")

    response = client.post(
        reverse("subscription-checkout"),
        {"accepted_terms": True},
        content_type="application/json",
        HTTP_X_FORWARDED_FOR="203.0.113.99, 198.51.100.24",
    )

    assert response.status_code == 200
    assert response.json()["monthly_price"] == "219.50"
    create_kwargs = session_create.call_args.kwargs
    price_data = create_kwargs["line_items"][0]["price_data"]
    assert price_data["unit_amount"] == 21950
    assert price_data["currency"] == "aud"
    assert price_data["tax_behavior"] == "inclusive"
    assert price_data["recurring"] == {"interval": "month"}
    assert create_kwargs["customer_update"] == {"address": "auto"}
    acceptance = DealerSubscriptionTermsAcceptance.objects.get()
    assert acceptance.monthly_price == Decimal("219.50")
    assert str(acceptance.accepted_ip) == "198.51.100.24"
    assert acceptance.stripe_checkout_session_id == "cs_test"
    assert create_kwargs["metadata"]["terms_acceptance_id"] == str(acceptance.pk)


@stripe_settings
def test_checkout_requires_terms_acceptance(client, dealer):
    response = client.post(reverse("subscription-checkout"), {}, content_type="application/json")
    assert response.status_code == 400
    assert not DealerSubscriptionTermsAcceptance.objects.exists()


@stripe_settings
def test_demo_account_does_not_create_checkout(client, dealer):
    dealer.plan = Dealer.Plan.DEMO
    dealer.payment_status = Dealer.PaymentStatus.DEMO
    dealer.save()
    response = client.post(
        reverse("subscription-checkout"),
        {"accepted_terms": True},
        content_type="application/json",
    )
    assert response.status_code == 400


@stripe_settings
@patch("payments.utils.services.stripe.checkout.Session.create")
@patch("payments.utils.services.stripe.Customer.create")
def test_repeated_checkout_reuses_same_offer_acceptance(customer_create, session_create, client, dealer):
    customer_create.return_value = Mock(id="cus_test")
    session_create.return_value = Mock(id="cs_test", client_secret="cs_test_secret")
    payload = {"accepted_terms": True}
    client.post(reverse("subscription-checkout"), payload, content_type="application/json")

    with patch("payments.utils.services.stripe.checkout.Session.retrieve") as retrieve:
        retrieve.return_value = {
            "id": "cs_test",
            "status": "open",
            "client_secret": "cs_test_secret",
            "metadata": {"terms_acceptance_id": str(DealerSubscriptionTermsAcceptance.objects.get().pk)},
        }
        response = client.post(reverse("subscription-checkout"), payload, content_type="application/json")
    assert response.status_code == 200
    assert DealerSubscriptionTermsAcceptance.objects.count() == 1
