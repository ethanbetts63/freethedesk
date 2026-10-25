from decimal import Decimal

import pytest
from django.urls import reverse

from affiliates.models import Affiliate, Commission
from affiliates.tests.factories import AffiliateFactory
from core.tests.factories import UserFactory
from payments.tests.view_tests.test_stripe_webhook_view import make_payment
from payments.flows import SEO_ONEOFF
from seo.tests.factories import SeoSubscriberFactory

pytestmark = pytest.mark.django_db


def _commission(affiliate, amount, status=Commission.Status.OWED, session_id="cs_1"):
    buyer = SeoSubscriberFactory(user=None, email="buyer@example.com")
    payment = make_payment(buyer, flow=SEO_ONEOFF, mode="payment", total="550.00", session_id=session_id)
    return Commission.objects.create(
        affiliate=affiliate,
        payment=payment,
        description="Essentials SEO audit",
        sale_amount=Decimal("550.00"),
        amount=Decimal(amount),
        status=status,
    )


def test_an_affiliate_sees_their_code_link_and_earnings(client, affiliate):
    _commission(affiliate, "275.00", session_id="cs_1")
    _commission(affiliate, "425.00", status=Commission.Status.PAID, session_id="cs_2")
    _commission(affiliate, "0.00", status=Commission.Status.VOID, session_id="cs_3")
    client.sign_in(affiliate.user)

    response = client.get(reverse("affiliate-account"))

    assert response.status_code == 200
    body = response.json()
    assert body["code"] == "THETRADIESHOW20"
    assert body["discount_percent"] == 20
    assert body["share_percent"] == 50
    assert body["share_link"].endswith("/seo?code=THETRADIESHOW20")
    assert body["earnings"] == {"sales": 2, "owed": "275.00", "paid": "425.00"}
    assert [c["status"] for c in body["commissions"]] == ["void", "paid", "owed"]


def test_an_affiliate_can_change_their_details_but_not_their_code_or_email(client, affiliate):
    client.sign_in(affiliate.user)

    response = client.patch(
        reverse("affiliate-account"),
        {"business_name": "The Tradie Hour", "email": "new@example.com", "code": "OTHER"},
        content_type="application/json",
    )

    assert response.status_code == 200
    affiliate.refresh_from_db()
    assert affiliate.business_name == "The Tradie Hour"
    assert affiliate.email == "sam@thetradieshow.com.au"
    assert affiliate.code == "THETRADIESHOW20"


def test_the_portal_is_for_affiliates_only(client):
    subscriber = SeoSubscriberFactory()
    client.sign_in(subscriber.user)

    assert client.get(reverse("affiliate-account")).status_code == 403
    assert client.get(reverse("affiliate-account")).status_code == 403


def test_an_affiliate_signs_in_as_an_affiliate_even_with_a_free_audit(client, affiliate):
    SeoSubscriberFactory(user=affiliate.user)
    client.sign_in(affiliate.user)

    profile = client.get("/api/auth/me/").json()

    assert profile["role"] == "affiliate"
    assert profile["affiliate"]["business_name"] == "The Tradie Show"
    assert profile["seo"]["business_name"]


def test_staff_list_search_and_suspend_affiliates(client, affiliate, staff_user):
    AffiliateFactory(user=UserFactory(username="jo@example.com"), business_name="Jo Talks Trades")
    client.sign_in(staff_user)

    listed = client.get(reverse("admin-affiliate-list"), {"search": "tradie show"}).json()
    assert [row["code"] for row in listed["results"]] == ["THETRADIESHOW20"]

    response = client.patch(
        reverse("admin-affiliate-detail", args=[affiliate.pk]),
        {"status": "suspended", "staff_notes": "Posted the code on a coupon site."},
        content_type="application/json",
    )

    assert response.status_code == 200
    affiliate.refresh_from_db()
    assert affiliate.status == Affiliate.Status.SUSPENDED
    assert affiliate.status_changed_at is not None
    # The listener's code stops working at checkout with the account.
    assert affiliate.discount.is_active is False

    client.patch(
        reverse("admin-affiliate-detail", args=[affiliate.pk]),
        {"status": "active"},
        content_type="application/json",
    )
    affiliate.discount.refresh_from_db()
    assert affiliate.discount.is_active is True


def test_the_staff_pages_are_for_staff(client, affiliate):
    client.sign_in(affiliate.user)

    assert client.get(reverse("admin-affiliate-list")).status_code == 403
    assert client.get(reverse("admin-affiliate-detail", args=[affiliate.pk])).status_code == 403
