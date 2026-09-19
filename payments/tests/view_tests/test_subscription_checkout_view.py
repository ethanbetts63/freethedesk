from decimal import Decimal
from unittest.mock import Mock, patch

import pytest
from django.urls import reverse
from freetheplatform.agreements import Acceptance

from core.models import SiteSettings
from payments.tests.conftest import stripe_settings
from payments.tests.stripe_fake import FakeStripe
from payments.utils.agreements import DEALER_AGREEMENT_KEY

pytestmark = pytest.mark.django_db


@pytest.fixture
def ftp_stripe():
    """Fake the package's Stripe client.

    Checkout goes through ``freetheplatform.payments`` now, so this is the one
    seam both the customer and the session go through.
    """
    fake = FakeStripe()
    with patch("freetheplatform.payments.client.get_client", return_value=fake):
        yield fake


@stripe_settings
def test_checkout_uses_backend_price_and_records_terms(ftp_stripe, client, logged_in_dealer):
    SiteSettings.load()
    settings = SiteSettings.load()
    settings.complete_price = Decimal("219.50")
    settings.save()

    response = client.post(
        reverse("subscription-checkout"),
        {"accepted_terms": True},
        content_type="application/json",
        HTTP_X_FORWARDED_FOR="203.0.113.99, 198.51.100.24",
        HTTP_USER_AGENT="Test Browser/1.0",
    )

    assert response.status_code == 200
    assert response.json()["monthly_price"] == "219.50"
    assert "terms_version" not in response.json()
    create_kwargs = ftp_stripe.last_session
    price_data = create_kwargs["line_items"][0]["price_data"]
    assert price_data["unit_amount"] == 21950
    assert price_data["currency"] == "aud"
    # The package normalises a recurring line, so interval_count is always
    # explicit rather than left to Stripe's default.
    assert price_data["recurring"] == {"interval": "month", "interval_count": 1}
    # No GST: the entity taking these payments is not registered for it, so
    # nothing describes part of the price as tax and Stripe is not asked to
    # calculate any. Asserted as absence because the absence is the position.
    # See _docs/stripe-subscriptions.md.
    assert "tax_behavior" not in price_data
    assert "automatic_tax" not in create_kwargs
    assert "billing_address_collection" not in create_kwargs
    acceptance = Acceptance.objects.get(
        agreement_version__agreement__key=DEALER_AGREEMENT_KEY
    )
    assert acceptance.context["price"] == "219.50"
    assert str(acceptance.accepted_ip) == "198.51.100.24"
    assert acceptance.user_agent == "Test Browser/1.0"
    assert acceptance.actor_snapshot["email"] == logged_in_dealer.user.email
    assert acceptance.statement.startswith("I agree to the Dealer Subscription Terms")
    assert acceptance.agreement_version.content_archived is True
    assert acceptance.agreement_version.content
    # Metadata is the package's standard set now: enough to find the local
    # record and nothing personal. The acceptance is still bound to it.
    metadata = create_kwargs["metadata"]
    assert metadata["ftp_agreement_acceptance"] == str(acceptance.pk)
    assert metadata["ftp_flow"] == "dealer.subscription"
    assert metadata["ftp_reference"] == str(logged_in_dealer.pk)
    assert metadata["ftp_site"] == "freethedesk"


@stripe_settings
def test_checkout_requires_terms_acceptance(client, logged_in_dealer):
    response = client.post(reverse("subscription-checkout"), {}, content_type="application/json")
    assert response.status_code == 400
    assert not Acceptance.objects.filter(
        agreement_version__agreement__key=DEALER_AGREEMENT_KEY
    ).exists()


@stripe_settings
def test_repeated_checkout_reuses_the_offer_and_the_session(ftp_stripe, client, logged_in_dealer):
    """A refresh must not produce a second way to be charged.

    The retrieve/expire dance the old code did by hand is the package's now,
    so this asserts the outcome rather than the mechanism: one acceptance, one
    Stripe session, whatever the customer does to the page.
    """
    payload = {"accepted_terms": True}
    first = client.post(reverse("subscription-checkout"), payload, content_type="application/json")
    second = client.post(reverse("subscription-checkout"), payload, content_type="application/json")

    assert first.status_code == 200
    assert second.status_code == 200
    assert second.json()["client_secret"] == first.json()["client_secret"]
    assert ftp_stripe.session_count == 1
    assert Acceptance.objects.filter(
        agreement_version__agreement__key=DEALER_AGREEMENT_KEY
    ).count() == 1


@stripe_settings
def test_a_price_change_forces_a_new_checkout(ftp_stripe, client, logged_in_dealer):
    payload = {"accepted_terms": True}
    client.post(reverse("subscription-checkout"), payload, content_type="application/json")

    site_settings = SiteSettings.load()
    site_settings.complete_price = Decimal("299.00")
    site_settings.save()
    client.post(reverse("subscription-checkout"), payload, content_type="application/json")

    # The old session is expired rather than left open beside the new one.
    assert ftp_stripe.session_count == 2
    assert ftp_stripe.sessions["cs_test_1"].status == "expired"
    assert ftp_stripe.last_session["line_items"][0]["price_data"]["unit_amount"] == 29900
