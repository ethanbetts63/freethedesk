from decimal import Decimal
from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from freetheplatform.agreements import Acceptance

from core.models import SiteSettings
from payments.tests.conftest import stripe_settings
from payments.tests.stripe_fake import FakeStripe
from payments.utils.agreements import SEO_AGREEMENT_KEY
from payments.utils.seo_services import accept_current_seo_offer
from seo.models import SeoSubscriber
from seo.tests.factories import SeoSubscriberFactory

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


@pytest.fixture
def signup():
    """An unpaid signup: details and a reference, no login."""
    return SeoSubscriberFactory(user=None, email="jo@peakdigital.com.au")


def _accept(signup, accepted_ip="198.51.100.24"):
    """What the signup form does: record the terms for the current offer."""
    accept_current_seo_offer(subscriber=signup, accepted_ip=accepted_ip)


def _checkout(client, signup, **extra):
    return client.post(
        reverse("payments:seo-subscription-checkout"),
        {"reference": signup.checkout_reference},
        content_type="application/json",
        **extra,
    )


@stripe_settings
def test_quarterly_checkout_is_a_three_month_subscription(ftp_stripe, client, signup):
    settings = SiteSettings.load()
    settings.seo_quarterly_price = Decimal("150.00")
    settings.save()
    signup.plan = SeoSubscriber.Plan.QUARTERLY
    signup.save(update_fields=["plan"])
    _accept(signup)

    response = _checkout(client, signup)

    assert response.status_code == 200
    body = response.json()
    assert body["price"] == "150.00"
    assert body["mode"] == "subscription"
    assert "terms_version" not in body
    create_kwargs = ftp_stripe.last_session
    assert create_kwargs["mode"] == "subscription"
    price_data = create_kwargs["line_items"][0]["price_data"]
    assert price_data["unit_amount"] == 15000
    assert price_data["recurring"] == {"interval": "month", "interval_count": 3}
    assert "subscription_data" in create_kwargs
    acceptance = Acceptance.objects.get(
        agreement_version__agreement__key=SEO_AGREEMENT_KEY
    )
    assert acceptance.context["price"] == "150.00"
    metadata = create_kwargs["metadata"]
    assert metadata["ftp_reference"] == str(signup.pk)
    assert metadata["ftp_agreement_acceptance"] == str(acceptance.pk)
    assert metadata["ftp_flow"] == "seo.subscription"


@stripe_settings
def test_one_off_checkout_is_a_single_payment(ftp_stripe, client, signup):
    signup.plan = SeoSubscriber.Plan.ONEOFF
    signup.save(update_fields=["plan"])
    settings = SiteSettings.load()
    settings.seo_oneoff_price = Decimal("250.00")
    settings.save()
    _accept(signup)

    response = _checkout(client, signup)

    assert response.status_code == 200
    assert response.json()["mode"] == "payment"
    create_kwargs = ftp_stripe.last_session
    assert create_kwargs["mode"] == "payment"
    price_data = create_kwargs["line_items"][0]["price_data"]
    assert price_data["unit_amount"] == 25000
    assert "recurring" not in price_data
    assert "subscription_data" not in create_kwargs
    # A one-off is a PaymentIntent, and carries the same reference set.
    assert create_kwargs["payment_intent_data"]["metadata"]["ftp_flow"] == "seo.oneoff"


@pytest.mark.parametrize(
    ("plan", "price_field", "months"),
    [
        (SeoSubscriber.Plan.MONTHLY, "seo_monthly_price", 1),
        (SeoSubscriber.Plan.QUARTERLY, "seo_quarterly_price", 3),
        (SeoSubscriber.Plan.YEARLY, "seo_yearly_price", 12),
    ],
)
@stripe_settings
def test_each_cadence_bills_its_own_price(
    ftp_stripe, client, signup, plan, price_field, months
):
    signup.plan = plan
    signup.save(update_fields=["plan"])
    settings = SiteSettings.load()
    settings.seo_monthly_price = Decimal("111.00")
    settings.seo_quarterly_price = Decimal("222.00")
    settings.seo_yearly_price = Decimal("333.00")
    settings.save()
    price = getattr(settings, price_field)
    _accept(signup)

    response = _checkout(client, signup)

    assert response.status_code == 200
    assert response.json()["price"] == str(price)
    line_items = ftp_stripe.last_session["line_items"]
    assert len(line_items) == 1
    price_data = line_items[0]["price_data"]
    assert price_data["unit_amount"] == int(price * 100)
    assert price_data["recurring"] == {"interval": "month", "interval_count": months}


@stripe_settings
def test_checkout_without_a_signup_acceptance_is_refused(ftp_stripe, client, signup):
    response = _checkout(client, signup)

    assert response.status_code == 409
    assert response.json()["code"] == "offer_changed"
    assert ftp_stripe.session_count == 0


@stripe_settings
def test_a_price_change_after_signup_needs_a_fresh_acceptance(ftp_stripe, client, signup):
    # The customer agreed to one price; checkout must not charge another.
    signup.plan = SeoSubscriber.Plan.MONTHLY
    signup.save(update_fields=["plan"])
    _accept(signup)
    settings = SiteSettings.load()
    settings.seo_monthly_price += Decimal("1.00")
    settings.save()

    response = _checkout(client, signup)

    assert response.status_code == 409
    assert response.json()["code"] == "offer_changed"
    assert ftp_stripe.session_count == 0


@stripe_settings
def test_an_unknown_reference_finds_nothing(client):
    response = client.post(
        reverse("payments:seo-subscription-checkout"),
        {"reference": "not-a-real-reference"},
        content_type="application/json",
    )
    assert response.status_code == 404


@stripe_settings
def test_a_paid_signup_cannot_pay_again(ftp_stripe, client, signup):
    signup.payment_status = SeoSubscriber.PaymentStatus.ACTIVE
    signup.save(update_fields=["payment_status"])

    response = _checkout(client, signup)

    assert response.status_code == 409
    assert response.json()["code"] == "active"
    assert ftp_stripe.session_count == 0


@stripe_settings
def test_an_email_with_an_account_is_sent_to_sign_in(ftp_stripe, client, signup):
    # Signed up, then the same email became a paid account through another
    # signup: this reference must not take a second payment.
    get_user_model().objects.create_user(username=signup.email, email=signup.email, password="x")

    response = _checkout(client, signup)

    assert response.status_code == 409
    assert response.json()["code"] == "account_exists"
    assert ftp_stripe.session_count == 0
