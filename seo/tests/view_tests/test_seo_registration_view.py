import pytest
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.urls import reverse

from seo.models import SeoSubscriber

pytestmark = pytest.mark.django_db

PAYLOAD = {
    "email": "jo@peakdigital.com.au",
    "phone": "0400 000 000",
    "website": "https://peakdigital.com.au",
    "plan": "monthly",
}


@pytest.fixture(autouse=True)
def _clear_throttle_cache():
    cache.clear()


def test_signup_creates_pending_subscriber_and_user(client):
    response = client.post(reverse("seo-signup"), PAYLOAD, content_type="application/json")
    assert response.status_code == 201

    subscriber = SeoSubscriber.objects.get()
    assert subscriber.status == SeoSubscriber.Status.PENDING
    assert subscriber.plan == SeoSubscriber.Plan.MONTHLY
    assert subscriber.payment_status == SeoSubscriber.PaymentStatus.PAYMENT_PENDING
    assert subscriber.business_name == "peakdigital.com.au"
    assert subscriber.contact_name == "Account owner"
    assert not subscriber.user.is_staff
    assert not subscriber.user.has_usable_password()
    assert response.json()["role"] == "seo"
    assert response.cookies["freethedesk_access"].value
    assert response.cookies["freethedesk_refresh"].value


def test_signup_defaults_plan_to_monthly(client):
    payload = {key: value for key, value in PAYLOAD.items() if key != "plan"}
    response = client.post(reverse("seo-signup"), payload, content_type="application/json")
    assert response.status_code == 201
    assert SeoSubscriber.objects.get().plan == SeoSubscriber.Plan.MONTHLY


def test_signup_accepts_a_one_off(client):
    response = client.post(
        reverse("seo-signup"), {**PAYLOAD, "plan": "oneoff"}, content_type="application/json"
    )
    assert response.status_code == 201
    assert SeoSubscriber.objects.get().is_one_off


@pytest.mark.parametrize("plan", ["bimonthly", "quarterly", "biannual"])
def test_signup_rejects_the_slower_cadences(client, plan):
    # A subscription always starts monthly; slower cadences come later.
    response = client.post(
        reverse("seo-signup"), {**PAYLOAD, "plan": plan}, content_type="application/json"
    )
    assert response.status_code == 400
    assert not SeoSubscriber.objects.exists()


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


def test_signup_tells_staff_but_not_the_customer(client, outbox):
    # The customer is mid-checkout; their email comes once payment lands.
    client.post(reverse("seo-signup"), PAYLOAD, content_type="application/json")

    subscriber = SeoSubscriber.objects.get()
    sent = {(message.message_type, message.channel) for message in outbox}
    assert sent == {
        ("seo.staff_signup", "email"),
        ("seo.staff_signup", "sms"),
    }
    assert all(message.content_object == subscriber for message in outbox)


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


