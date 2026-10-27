import pytest
from django.urls import reverse
from django.utils import timezone
from freetheplatform.payments import PaymentStatus

from payments.flows import SEO_ONEOFF
from payments.tests.view_tests.test_stripe_webhook_view import make_payment
from seo.models import SeoSubscriber

pytestmark = pytest.mark.django_db


def test_list_requires_staff(client, seo_subscriber):
    assert client.get(reverse("admin-seo-list")).status_code == 401


def test_seo_subscriber_cannot_reach_staff_endpoints(client, seo_subscriber):
    client.sign_in(seo_subscriber.user)
    assert client.get(reverse("admin-seo-list")).status_code == 403


def test_staff_can_list_subscribers(client, seo_subscriber, staff_user):
    client.sign_in(staff_user)
    response = client.get(reverse("admin-seo-list"))
    assert response.status_code == 200
    assert response.json()["results"][0]["business_name"] == "Peak Digital"


def test_staff_can_search_subscribers(client, seo_subscriber, staff_user):
    client.sign_in(staff_user)
    response = client.get(reverse("admin-seo-list"), {"search": "peak"})
    assert response.json()["count"] == 1
    response = client.get(reverse("admin-seo-list"), {"search": "nomatch"})
    assert response.json()["count"] == 0


def test_the_detail_names_the_sale_once_a_payment_succeeded(client, paid_seo_subscriber, staff_user):
    client.sign_in(staff_user)
    assert client.get(reverse("admin-seo-detail", args=[paid_seo_subscriber.pk])).json()["sale"] is None

    payment = make_payment(paid_seo_subscriber, flow=SEO_ONEOFF, mode="payment", total="850.00")
    payment.status = PaymentStatus.SUCCEEDED
    payment.paid_at = timezone.now()
    payment.save(update_fields=["status", "paid_at"])

    sale = client.get(reverse("admin-seo-detail", args=[paid_seo_subscriber.pk])).json()["sale"]
    assert sale["amount_paid"] == "850.00"
    assert sale["discount_code"] == ""
    assert sale["affiliate"] is None


def test_approving_stamps_status_changed_at(client, seo_subscriber, staff_user):
    client.sign_in(staff_user)
    response = client.patch(
        reverse("admin-seo-detail", args=[seo_subscriber.pk]),
        {"status": "active", "staff_notes": "Verified by phone."},
        content_type="application/json",
    )
    assert response.status_code == 200
    seo_subscriber.refresh_from_db()
    assert seo_subscriber.status == SeoSubscriber.Status.ACTIVE
    assert seo_subscriber.staff_notes == "Verified by phone."
    assert seo_subscriber.status_changed_at is not None
