"""Ordering a package from a service page: the order, its terms, its status, and the staff view.

Checkout itself is in payments/tests/view_tests/test_package_order_checkout_view.py.
"""

from decimal import Decimal

import pytest
from freetheplatform.agreements import Acceptance

from core.models import PackageOrder, SiteSettings
from payments.utils.agreements import PACKAGE_AGREEMENT_KEY

pytestmark = pytest.mark.django_db

ORDER_URL = "/api/package-orders/"


def order(api_client, **fields):
    payload = {"package": "website_small", "email": "owner@example.com.au", "accepted_terms": True}
    payload.update(fields)
    return api_client.post(ORDER_URL, payload, format="json")


@pytest.fixture
def staff_client(api_client, staff_user):
    api_client.force_authenticate(staff_user)
    return api_client


def test_a_website_order_records_the_admin_price_and_half_due_now(api_client, outbox):
    response = order(
        api_client,
        phone="0400 000 000",
        website="https://www.example.com.au",
        notes="We sell outdoor furniture.",
        # Ignored: the price comes from the admin, never the browser.
        price="1.00",
        due_now="1.00",
    )

    assert response.status_code == 201
    placed = PackageOrder.objects.get()
    assert response.json() == {"reference": placed.checkout_reference}
    assert placed.package_name == "6-page website"
    assert placed.price == Decimal("3000.00")
    assert placed.due_now == Decimal("1500.00")
    assert placed.balance == Decimal("1500.00")
    assert placed.business_name == "example.com.au"
    assert placed.payment_status == PackageOrder.PaymentStatus.PAYMENT_PENDING
    # Staff hear about it by email; the SMS waits for the payment.
    assert [(message.channel, message.to) for message in outbox] == [("email", "staff@example.com")]
    assert "awaiting payment" in outbox[0].subject


def test_the_order_records_the_web_development_terms_it_was_placed_under(api_client):
    order(api_client, package="website_large")

    placed = PackageOrder.objects.get()
    acceptance = Acceptance.objects.for_related(placed).get()
    assert acceptance.agreement_version.agreement.key == PACKAGE_AGREEMENT_KEY
    assert acceptance.context == {
        "package": "website_large",
        "price": "6000.00",
        "due_now": "3000.00",
        "currency": "AUD",
        "billing_mode": "payment",
        "tax_inclusive": True,
    }
    assert acceptance.actor_snapshot == {"email": "owner@example.com.au"}


def test_an_order_without_the_terms_is_refused(api_client, outbox):
    response = order(api_client, accepted_terms=False)

    assert response.status_code == 400
    assert "accepted_terms" in response.json()
    assert not PackageOrder.objects.exists()
    assert not outbox


def test_the_large_package_follows_the_admin_settings(api_client):
    settings = SiteSettings.load()
    settings.website_large_pages = 12
    settings.website_large_page_price = Decimal("550.00")
    settings.save()

    order(api_client, package="website_large")

    placed = PackageOrder.objects.get()
    assert placed.package_name == "12-page website"
    assert placed.price == Decimal("6600.00")
    assert placed.due_now == Decimal("3300.00")
    # No website given: the business is named from the email's domain.
    assert placed.business_name == "example.com.au"


@pytest.mark.parametrize(
    ("package", "name"),
    [
        ("web_application", "Web application discovery"),
        ("automation_discovery", "Automation discovery"),
    ],
)
def test_discovery_is_paid_in_full(api_client, package, name):
    order(api_client, package=package)

    placed = PackageOrder.objects.get()
    assert placed.package_name == name
    assert placed.price == Decimal("450.00")
    assert placed.due_now == Decimal("450.00")
    assert placed.balance == 0


def test_an_unknown_package_is_refused(api_client):
    response = order(api_client, package="website_connect")

    assert response.status_code == 400
    assert "package" in response.json()
    assert not PackageOrder.objects.exists()


def test_the_status_says_what_was_bought_and_nothing_about_the_buyer(api_client):
    order(api_client, package="website_large", phone="0400 000 000")
    placed = PackageOrder.objects.get()

    response = api_client.get(f"{ORDER_URL}{placed.checkout_reference}/")

    assert response.status_code == 200
    assert response.json() == {
        "package": "website_large",
        "package_name": "10-page website",
        "price": "6000.00",
        "due_now": "3000.00",
        "paid": False,
    }


def test_an_unknown_reference_has_no_status(api_client):
    assert api_client.get(f"{ORDER_URL}not-a-reference/").status_code == 404


def test_orders_are_staff_only(api_client):
    assert api_client.get("/api/admin/package-orders/").status_code in (401, 403)


def test_staff_see_orders_with_what_is_still_owed(api_client, staff_client):
    order(api_client, package="website_large")
    order(api_client, package="web_application", email="other@example.org")

    results = staff_client.get("/api/admin/package-orders/", {"search": "example.com.au"}).json()[
        "results"
    ]

    assert [(row["package_name"], row["balance"]) for row in results] == [
        ("10-page website", "3000.00")
    ]
    detail = staff_client.get(f"/api/admin/package-orders/{results[0]['id']}/").json()
    assert detail["payment_status_label"] == "Payment pending"
    assert "checkout_reference" not in detail
