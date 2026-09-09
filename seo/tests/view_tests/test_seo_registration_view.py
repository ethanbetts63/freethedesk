import pytest
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.urls import reverse

from core.models import Notification
from seo.models import SeoSubscriber

pytestmark = pytest.mark.django_db

PAYLOAD = {
    "email": "jo@peakdigital.com.au",
    "phone": "0400 000 000",
    "website": "https://peakdigital.com.au",
    "report_type": "both",
    "plan": "quarterly",
}


@pytest.fixture(autouse=True)
def _clear_throttle_cache():
    cache.clear()


def test_signup_creates_pending_subscriber_and_user(client):
    response = client.post(reverse("seo-signup"), PAYLOAD, content_type="application/json")
    assert response.status_code == 201

    subscriber = SeoSubscriber.objects.get()
    assert subscriber.status == SeoSubscriber.Status.PENDING
    assert subscriber.plan == SeoSubscriber.Plan.QUARTERLY
    assert subscriber.report_type == SeoSubscriber.ReportType.BOTH
    assert subscriber.payment_status == SeoSubscriber.PaymentStatus.PAYMENT_PENDING
    assert subscriber.business_name == "peakdigital.com.au"
    assert subscriber.contact_name == "Account owner"
    assert not subscriber.user.is_staff
    assert not subscriber.user.has_usable_password()
    assert response.json()["role"] == "seo"
    assert response.cookies["freethedesk_access"].value
    assert response.cookies["freethedesk_refresh"].value


def test_signup_defaults_plan_to_quarterly(client):
    payload = {key: value for key, value in PAYLOAD.items() if key != "plan"}
    response = client.post(reverse("seo-signup"), payload, content_type="application/json")
    assert response.status_code == 201
    assert SeoSubscriber.objects.get().plan == SeoSubscriber.Plan.QUARTERLY


def test_signup_accepts_one_off_plan(client):
    response = client.post(
        reverse("seo-signup"), {**PAYLOAD, "plan": "oneoff"}, content_type="application/json"
    )
    assert response.status_code == 201
    assert SeoSubscriber.objects.get().plan == SeoSubscriber.Plan.ONEOFF


def test_signup_accepts_standalone_google_business_profile_audit(client):
    response = client.post(
        reverse("seo-signup"),
        {**PAYLOAD, "plan": "oneoff", "report_type": "gbp"},
        content_type="application/json",
    )
    assert response.status_code == 201
    subscriber = SeoSubscriber.objects.get()
    assert subscriber.plan == SeoSubscriber.Plan.ONEOFF
    assert subscriber.report_type == SeoSubscriber.ReportType.GBP
    assert subscriber.is_one_off


def test_signup_rejects_unknown_plan(client):
    response = client.post(
        reverse("seo-signup"), {**PAYLOAD, "plan": "forever-free"}, content_type="application/json"
    )
    assert response.status_code == 400
    assert not SeoSubscriber.objects.exists()


def test_signup_allows_missing_website(client):
    payload = {key: value for key, value in PAYLOAD.items() if key != "website"}
    response = client.post(reverse("seo-signup"), payload, content_type="application/json")
    assert response.status_code == 201


def test_signup_records_staff_and_customer_notifications(client):
    client.post(reverse("seo-signup"), PAYLOAD, content_type="application/json")

    subscriber = SeoSubscriber.objects.get()
    assert subscriber.notifications.count() == 3
    assert subscriber.notifications.filter(recipient_type=Notification.RecipientType.SEO).exists()
    assert subscriber.notifications.filter(recipient_type=Notification.RecipientType.ADMIN).count() == 2


def test_signup_rejects_duplicate_email(client):
    get_user_model().objects.create_user(username="existing", email=PAYLOAD["email"], password="x")
    response = client.post(reverse("seo-signup"), PAYLOAD, content_type="application/json")
    assert response.status_code == 400
    assert not SeoSubscriber.objects.exists()


def test_signup_rejects_email_colliding_with_an_existing_username(client):
    # Signup accounts use username == email, so a taken username blocks reuse
    # even when no row has that address in the email column.
    get_user_model().objects.create_user(username=PAYLOAD["email"], email="", password="x")
    response = client.post(reverse("seo-signup"), PAYLOAD, content_type="application/json")
    assert response.status_code == 400
    assert not SeoSubscriber.objects.exists()


def test_signup_rejects_weak_password(client):
    response = client.post(
        reverse("seo-signup"), {**PAYLOAD, "password": "password"}, content_type="application/json"
    )
    assert response.status_code == 400
    assert not SeoSubscriber.objects.exists()


