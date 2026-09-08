from decimal import Decimal
from unittest.mock import Mock, patch

import pytest
from django.urls import reverse

from core.models import SiteSettings
from payments.models import SeoSubscriptionTermsAcceptance
from payments.tests.conftest import stripe_settings
from seo.models import SeoSubscriber

pytestmark = pytest.mark.django_db


@stripe_settings
@patch("payments.utils.seo_services.stripe.checkout.Session.create")
@patch("payments.utils.seo_services.stripe.Customer.create")
def test_quarterly_checkout_is_a_three_month_subscription(customer_create, session_create, client, logged_in_seo_subscriber):
    settings = SiteSettings.load()
    settings.seo_quarterly_price = Decimal("150.00")
    settings.save()
    customer_create.return_value = Mock(id="cus_test")
    session_create.return_value = Mock(id="cs_test", client_secret="cs_test_secret")

    response = client.post(
        reverse("seo-subscription-checkout"),
        {"accepted_terms": True},
        content_type="application/json",
        HTTP_X_FORWARDED_FOR="203.0.113.99, 198.51.100.24",
    )

    assert response.status_code == 200
    body = response.json()
    assert body["price"] == "150.00"
    assert body["mode"] == "subscription"
    create_kwargs = session_create.call_args.kwargs
    assert create_kwargs["mode"] == "subscription"
    price_data = create_kwargs["line_items"][0]["price_data"]
    assert price_data["unit_amount"] == 15000
    assert price_data["recurring"] == {"interval": "month", "interval_count": 3}
    assert "subscription_data" in create_kwargs
    acceptance = SeoSubscriptionTermsAcceptance.objects.get()
    assert acceptance.price == Decimal("150.00")
    assert str(acceptance.accepted_ip) == "198.51.100.24"
    assert create_kwargs["metadata"]["subscriber_id"] == str(logged_in_seo_subscriber.pk)
    assert create_kwargs["metadata"]["terms_acceptance_id"] == str(acceptance.pk)


@stripe_settings
@patch("payments.utils.seo_services.stripe.checkout.Session.create")
@patch("payments.utils.seo_services.stripe.Customer.create")
def test_one_off_checkout_is_a_single_payment(customer_create, session_create, client, seo_subscriber):
    seo_subscriber.plan = SeoSubscriber.Plan.ONEOFF
    seo_subscriber.save(update_fields=["plan"])
    client.force_login(seo_subscriber.user)
    settings = SiteSettings.load()
    settings.seo_oneoff_price = Decimal("250.00")
    settings.save()
    customer_create.return_value = Mock(id="cus_test")
    session_create.return_value = Mock(id="cs_test", client_secret="cs_test_secret")

    response = client.post(
        reverse("seo-subscription-checkout"),
        {"accepted_terms": True},
        content_type="application/json",
    )

    assert response.status_code == 200
    assert response.json()["mode"] == "payment"
    create_kwargs = session_create.call_args.kwargs
    assert create_kwargs["mode"] == "payment"
    price_data = create_kwargs["line_items"][0]["price_data"]
    assert price_data["unit_amount"] == 25000
    assert "recurring" not in price_data
    assert "subscription_data" not in create_kwargs
    assert create_kwargs["payment_intent_data"]["metadata"]["subscriber_id"] == str(seo_subscriber.pk)


@stripe_settings
def test_checkout_requires_terms_acceptance(client, logged_in_seo_subscriber):
    response = client.post(reverse("seo-subscription-checkout"), {}, content_type="application/json")
    assert response.status_code == 400
    assert not SeoSubscriptionTermsAcceptance.objects.exists()


@stripe_settings
def test_dealer_cannot_use_seo_checkout(client, logged_in_dealer):
    response = client.post(
        reverse("seo-subscription-checkout"),
        {"accepted_terms": True},
        content_type="application/json",
    )
    assert response.status_code == 403
