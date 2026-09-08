import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse

from core.tests.factories import UserFactory
from dealers.models import Dealer, DealerProfile

pytestmark = pytest.mark.django_db


def test_login_returns_dealer_principal(client, dealer):
    response = client.post(
        reverse("token"),
        {"username": "d@example.com", "password": "Sturdy-Passphrase-42"},
        content_type="application/json",
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["role"] == "dealer"
    assert not payload["is_staff"]
    assert payload["dealer"]["business_name"] == "Bikes WA"
    assert payload["dealer"]["status"] == "pending"


def test_pending_dealer_may_still_sign_in(client, dealer):
    assert dealer.status == Dealer.Status.PENDING
    response = client.post(
        reverse("token"),
        {"username": "d@example.com", "password": "Sturdy-Passphrase-42"},
        content_type="application/json",
    )
    assert response.status_code == 200


def test_user_without_a_portal_is_refused(client, dealer):
    UserFactory(username="nobody@example.com")
    response = client.post(
        reverse("token"),
        {"username": "nobody@example.com", "password": "Sturdy-Passphrase-42"},
        content_type="application/json",
    )
    assert response.status_code == 403


def test_dealer_can_read_and_update_own_account(client, dealer):
    client.force_login(dealer.user)
    assert client.get(reverse("dealer-profile")).json()["business_name"] == "Bikes WA"

    response = client.patch(
        reverse("dealer-profile"),
        {"business_name": "Bikes WA Pty Ltd", "phone": "0400 333 444"},
        content_type="application/json",
    )
    assert response.status_code == 200
    dealer.refresh_from_db()
    assert dealer.business_name == "Bikes WA Pty Ltd"
    assert dealer.phone == "0400 333 444"


def test_dealer_cannot_change_own_status_or_email(client, dealer):
    client.force_login(dealer.user)
    client.patch(
        reverse("dealer-profile"),
        {"status": "active", "email": "someone@else.com"},
        content_type="application/json",
    )
    dealer.refresh_from_db()
    assert dealer.status == Dealer.Status.PENDING
    assert dealer.user.email == "d@example.com"


def test_staff_cannot_use_the_dealer_profile_endpoint(client, dealer, staff_user):
    client.force_login(staff_user)
    assert client.get(reverse("dealer-profile")).status_code == 403


def test_dealer_cannot_reach_staff_endpoints(client, dealer):
    client.force_login(dealer.user)
    assert client.get(reverse("admin-dealer-list")).status_code == 403


def test_onboarding_requires_active_payment(client, dealer):
    client.force_login(dealer.user)
    response = client.get(reverse("dealer-onboarding"))
    assert response.status_code == 403


def test_paid_dealer_can_save_onboarding_draft(client, dealer):
    dealer.plan = Dealer.Plan.COMPLETE
    dealer.payment_status = Dealer.PaymentStatus.ACTIVE
    dealer.save()
    client.force_login(dealer.user)
    response = client.patch(
        reverse("dealer-onboarding"),
        {"legal_name": "Bikes WA Pty Ltd", "trading_name": "Bikes WA"},
        content_type="application/json",
    )
    assert response.status_code == 200
    profile = DealerProfile.objects.get(dealer=dealer)
    assert profile.legal_name == "Bikes WA Pty Ltd"
    assert profile.onboarding_status == DealerProfile.OnboardingStatus.IN_PROGRESS


def test_onboarding_rejects_a_file_disguised_by_its_extension(api_client, dealer):
    dealer.plan = Dealer.Plan.COMPLETE
    dealer.payment_status = Dealer.PaymentStatus.ACTIVE
    dealer.save()
    api_client.force_authenticate(user=dealer.user)
    response = api_client.patch(
        reverse("dealer-onboarding"),
        {"dealer_licence_document": SimpleUploadedFile(
            "licence.png", b"<script>not an image</script>", content_type="image/png"
        )},
        format="multipart",
    )
    assert response.status_code == 400
    assert "dealer_licence_document" in response.json()
