import pytest
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.urls import reverse

from core.models import Notification
from dealers.models import Dealer

pytestmark = pytest.mark.django_db

PAYLOAD = {
    "business_name": "Perth Motorcycle Centre",
    "contact_name": "Jo Ryan",
    "email": "jo@perthmotorcycles.com.au",
    "phone": "0400 000 000",
    "state": "WA",
    "password": "Sturdy-Passphrase-42",
}


@pytest.fixture(autouse=True)
def _clear_throttle_cache():
    # DealerSignupRateThrottle is cache-backed; without this, tests bleed into
    # each other's rate-limit buckets.
    cache.clear()


def test_signup_creates_pending_dealer_and_user(client):
    response = client.post(reverse("dealer-signup"), PAYLOAD, content_type="application/json")
    assert response.status_code == 201

    dealer = Dealer.objects.get()
    assert dealer.status == Dealer.Status.PENDING
    assert dealer.plan == Dealer.Plan.COMPLETE
    assert dealer.payment_status == Dealer.PaymentStatus.PAYMENT_PENDING
    assert dealer.business_name == "Perth Motorcycle Centre"
    assert not dealer.user.is_staff
    assert dealer.user.check_password("Sturdy-Passphrase-42")


def test_signup_allows_business_and_contact_names_to_be_completed_later(client):
    payload = {key: value for key, value in PAYLOAD.items() if key not in {"business_name", "contact_name"}}
    response = client.post(reverse("dealer-signup"), payload, content_type="application/json")
    assert response.status_code == 201

    dealer = Dealer.objects.get()
    assert dealer.business_name == "perthmotorcycles.com.au"
    assert dealer.contact_name == "Account owner"


def test_paid_plan_starts_payment_pending(client):
    response = client.post(
        reverse("dealer-signup"),
        {**PAYLOAD, "plan": Dealer.Plan.COMPLETE},
        content_type="application/json",
    )
    assert response.status_code == 201
    dealer = Dealer.objects.get()
    assert dealer.plan == Dealer.Plan.COMPLETE
    assert dealer.payment_status == Dealer.PaymentStatus.PAYMENT_PENDING


def test_signup_rejects_unknown_plan(client):
    response = client.post(
        reverse("dealer-signup"),
        {**PAYLOAD, "plan": "everything-for-free"},
        content_type="application/json",
    )
    assert response.status_code == 400
    assert not Dealer.objects.exists()


def test_signup_requires_state(client):
    payload = {key: value for key, value in PAYLOAD.items() if key != "state"}
    response = client.post(reverse("dealer-signup"), payload, content_type="application/json")
    assert response.status_code == 400
    assert not Dealer.objects.exists()


def test_signup_records_staff_and_dealer_notifications(client):
    client.post(reverse("dealer-signup"), PAYLOAD, content_type="application/json")

    dealer = Dealer.objects.get()
    assert dealer.notifications.count() == 3
    assert dealer.notifications.filter(recipient_type=Notification.RecipientType.DEALER).exists()
    assert dealer.notifications.filter(recipient_type=Notification.RecipientType.ADMIN).count() == 2


def test_signup_rejects_duplicate_email(client):
    get_user_model().objects.create_user(username="existing", email=PAYLOAD["email"], password="x")
    response = client.post(reverse("dealer-signup"), PAYLOAD, content_type="application/json")
    assert response.status_code == 400
    assert not Dealer.objects.exists()


def test_signup_rejects_weak_password(client):
    response = client.post(
        reverse("dealer-signup"),
        {**PAYLOAD, "password": "password"},
        content_type="application/json",
    )
    assert response.status_code == 400
    assert not Dealer.objects.exists()


