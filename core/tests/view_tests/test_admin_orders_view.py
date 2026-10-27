"""The Orders list: website packages and SEO audits as one list of money coming in."""

from decimal import Decimal

import pytest
from django.utils import timezone
from freetheplatform.payments import PaymentStatus

from core.models import PackageOrder
from payments.flows import SEO_ONEOFF
from payments.tests.view_tests.test_stripe_webhook_view import make_payment
from seo.models import SeoSubscriber
from seo.tests.factories import SeoSubscriberFactory

pytestmark = pytest.mark.django_db

URL = "/api/admin/orders/"


@pytest.fixture
def staff_client(api_client, staff_user):
    api_client.force_authenticate(staff_user)
    return api_client


def website_order(**fields):
    defaults = {
        "package": PackageOrder.Package.WEBSITE_SMALL,
        "package_name": "5-page website",
        "price": Decimal("3000.00"),
        "due_now": Decimal("1500.00"),
        "email": "owner@example.com.au",
        "business_name": "Example Co",
    }
    defaults.update(fields)
    return PackageOrder.objects.create(**defaults)


def paid_audit(**fields):
    subscriber = SeoSubscriberFactory(
        user=None, payment_status=SeoSubscriber.PaymentStatus.PAID, plan=SeoSubscriber.Plan.ESSENTIALS,
        **fields,
    )
    payment = make_payment(subscriber, flow=SEO_ONEOFF, mode="payment", total="440.00")
    payment.status = PaymentStatus.SUCCEEDED
    payment.paid_at = timezone.now()
    payment.save(update_fields=["status", "paid_at"])
    return subscriber


def test_orders_are_staff_only(api_client):
    assert api_client.get(URL).status_code in (401, 403)


def test_packages_and_audits_list_together_newest_first(staff_client):
    order = website_order(payment_status=PackageOrder.PaymentStatus.PAID)
    audit = paid_audit(business_name="Subiaco Florist", email="flowers@example.com.au")
    SeoSubscriberFactory(payment_status=SeoSubscriber.PaymentStatus.COMPLIMENTARY)

    rows = staff_client.get(URL).json()["results"]

    assert [(row["kind"], row["id"]) for row in rows] == [("audit", audit.pk), ("package", order.pk)]
    audit_row, package_row = rows
    # What the listener paid, from the payment, not the list price.
    assert audit_row["price"] == "440.00"
    assert audit_row["product_name"] == "Essentials SEO audit"
    assert audit_row["payment_status"] == "paid"
    assert audit_row["href"] == f"/dashboard/admin/seo/{audit.pk}"
    assert package_row["price"] == "3000.00"
    assert package_row["note"] == "$1,500.00 due before launch"
    assert package_row["href"] == f"/dashboard/admin/orders/{order.pk}"


def test_an_unpaid_audit_signup_is_a_pending_order_at_the_list_price(staff_client):
    SeoSubscriberFactory(
        user=None, payment_status=SeoSubscriber.PaymentStatus.PAYMENT_PENDING,
        plan=SeoSubscriber.Plan.PLUS,
    )

    rows = staff_client.get(URL, {"payment_status": "payment_pending"}).json()["results"]

    assert len(rows) == 1
    assert rows[0]["price"] == "850.00"
    assert rows[0]["payment_status_label"] == "Payment pending"


def test_the_list_filters_by_kind_and_searches_both(staff_client):
    website_order(business_name="Example Co")
    paid_audit(business_name="Subiaco Florist")

    assert [row["kind"] for row in staff_client.get(URL, {"kind": "audit"}).json()["results"]] == ["audit"]
    assert [row["kind"] for row in staff_client.get(URL, {"kind": "package"}).json()["results"]] == ["package"]
    found = staff_client.get(URL, {"search": "florist"}).json()["results"]
    assert [row["business_name"] for row in found] == ["Subiaco Florist"]
