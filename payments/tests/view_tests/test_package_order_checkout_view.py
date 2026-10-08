"""Paying for a package order: what is charged, against which terms, and when nothing is."""

from decimal import Decimal
from unittest.mock import patch

import pytest
from django.urls import reverse
from freetheplatform.agreements import Acceptance

from core.models import PackageOrder, SiteSettings
from payments.tests.conftest import stripe_settings
from payments.tests.stripe_fake import FakeStripe
from payments.utils.package_services import accept_current_package_offer

pytestmark = pytest.mark.django_db


@pytest.fixture
def ftp_stripe():
    fake = FakeStripe()
    with patch("freetheplatform.payments.client.get_client", return_value=fake):
        yield fake


def placed(package="website_large", **fields):
    """What the order form does: the order at today's price, and the terms recorded against it."""
    order = PackageOrder.objects.create(
        package=package,
        package_name=fields.pop("package_name", "10-page website"),
        price=fields.pop("price", Decimal("6000.00")),
        due_now=fields.pop("due_now", Decimal("3000.00")),
        email="owner@example.com.au",
        business_name="example.com.au",
        **fields,
    )
    accept_current_package_offer(order=order, accepted_ip="198.51.100.24")
    return order


def checkout(client, order):
    return client.post(
        reverse("payments:package-order-checkout"),
        {"reference": order.checkout_reference},
        content_type="application/json",
    )


@stripe_settings
def test_a_website_checkout_charges_the_first_half(ftp_stripe, client):
    order = placed()

    response = checkout(client, order)

    assert response.status_code == 200
    assert response.json()["due_now"] == "3000.00"
    session = ftp_stripe.last_session
    assert session["mode"] == "payment"
    line = session["line_items"][0]["price_data"]
    assert line["unit_amount"] == 300000
    assert line["product_data"]["name"] == "10-page website: first half"
    acceptance = Acceptance.objects.for_related(order).get()
    assert session["metadata"]["ftp_flow"] == "package.order"
    assert session["metadata"]["ftp_agreement_acceptance"] == str(acceptance.pk)
    assert session["metadata"]["ftp_reference"] == str(order.pk)


@stripe_settings
def test_discovery_is_charged_in_full(ftp_stripe, client):
    order = placed(
        "web_application",
        package_name="Web application discovery",
        price=Decimal("450.00"),
        due_now=Decimal("450.00"),
    )

    response = checkout(client, order)

    assert response.status_code == 200
    line = ftp_stripe.last_session["line_items"][0]["price_data"]
    assert line["unit_amount"] == 45000
    assert line["product_data"]["name"] == "Web application discovery"


@stripe_settings
def test_a_price_change_after_ordering_charges_nothing(ftp_stripe, client):
    order = placed()
    settings = SiteSettings.load()
    settings.website_large_page_price = Decimal("650.00")
    settings.save()

    response = checkout(client, order)

    assert response.status_code == 409
    assert response.json()["code"] == "offer_changed"
    assert ftp_stripe.session_count == 0


@stripe_settings
def test_a_paid_order_is_not_charged_again(ftp_stripe, client):
    order = placed()
    order.payment_status = PackageOrder.PaymentStatus.PAID
    order.save(update_fields=["payment_status"])

    response = checkout(client, order)

    assert response.status_code == 409
    assert response.json()["code"] == "active"


@stripe_settings
def test_an_unknown_reference_finds_nothing(ftp_stripe, client):
    response = client.post(
        reverse("payments:package-order-checkout"),
        {"reference": "not-a-reference"},
        content_type="application/json",
    )

    assert response.status_code == 404
