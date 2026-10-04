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


def test_signup_records_the_details_and_makes_no_login(client):
    response = client.post(reverse("seo-signup"), PAYLOAD, content_type="application/json")
    assert response.status_code == 201

    subscriber = SeoSubscriber.objects.get()
    assert subscriber.status == SeoSubscriber.Status.PENDING
    assert subscriber.plan == SeoSubscriber.Plan.MONTHLY
    assert subscriber.payment_status == SeoSubscriber.PaymentStatus.PAYMENT_PENDING
    assert subscriber.business_name == "peakdigital.com.au"
    assert subscriber.contact_name == "Account owner"
    assert subscriber.email == PAYLOAD["email"]
    assert subscriber.user is None
    assert not get_user_model().objects.exists()
    assert response.json() == {"reference": subscriber.checkout_reference}
    assert "freethedesk_access" not in response.cookies


def test_signing_up_twice_keeps_both_signups(client):
    # Someone who leaves checkout and comes back fills the form in again; both
    # attempts are worth knowing about.
    first = client.post(reverse("seo-signup"), PAYLOAD, content_type="application/json")
    second = client.post(reverse("seo-signup"), PAYLOAD, content_type="application/json")

    assert first.status_code == second.status_code == 201
    assert SeoSubscriber.objects.filter(email=PAYLOAD["email"]).count() == 2
    assert first.json()["reference"] != second.json()["reference"]


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


@pytest.mark.parametrize("plan", ["quarterly", "yearly"])
def test_signup_accepts_the_slower_cadences(client, plan):
    # The customer picks the pace they can act on.
    response = client.post(
        reverse("seo-signup"), {**PAYLOAD, "plan": plan}, content_type="application/json"
    )
    assert response.status_code == 201
    assert SeoSubscriber.objects.get().plan == plan


@pytest.mark.parametrize("plan", ["bimonthly", "biannual"])
def test_signup_rejects_the_retired_cadences(client, plan):
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


def test_signup_sends_an_existing_account_to_sign_in(client):
    get_user_model().objects.create_user(username="existing", email=PAYLOAD["email"], password="x")
    response = client.post(reverse("seo-signup"), PAYLOAD, content_type="application/json")
    assert response.status_code == 400
    assert response.json()["code"] == "account_exists"
    assert response.json()["detail"] == "You already have an account with this email."
    assert not SeoSubscriber.objects.exists()


def test_signup_matches_an_existing_account_by_username_too(client):
    # Signup accounts use username == email, so a taken username is the same
    # account even when no row has that address in the email column.
    get_user_model().objects.create_user(username=PAYLOAD["email"], email="", password="x")
    response = client.post(reverse("seo-signup"), PAYLOAD, content_type="application/json")
    assert response.status_code == 400
    assert response.json()["code"] == "account_exists"


def test_signup_ignores_a_login_nobody_can_use(client):
    # The old flow made a passwordless login at signup. It is no account to
    # sign in to, so it does not block a fresh signup.
    get_user_model().objects.create_user(username=PAYLOAD["email"], email=PAYLOAD["email"])
    response = client.post(reverse("seo-signup"), PAYLOAD, content_type="application/json")
    assert response.status_code == 201
