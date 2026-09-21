"""Bank details, signature and trading hours."""

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse

from dealers.models import DealerProfile

pytestmark = pytest.mark.django_db

URL = reverse("dealer-trading")

PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06"
    b"\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05"
    b"\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
)


def test_a_dealer_saves_where_the_money_goes(client, dealer):
    client.sign_in(dealer.user)

    response = client.patch(
        URL,
        {
            "bank_account_name": "Bikes WA Pty Ltd",
            "bank_bsb": "036004",
            "bank_account_number": "12 345 678",
            "signature_name": "Sam Lee",
        },
        content_type="application/json",
    )

    assert response.status_code == 200
    profile = DealerProfile.objects.get(dealer=dealer)
    # Stored hyphenated and space-free, because that is how a customer reads a
    # BSB back to their banking app.
    assert profile.bank_bsb == "036-004"
    assert profile.bank_account_number == "12345678"


@pytest.mark.parametrize("value", ["03600", "0360045", "03-6004", "abcdef"])
def test_a_bsb_that_is_not_six_digits_is_refused(client, dealer, value):
    client.sign_in(dealer.user)

    response = client.patch(URL, {"bank_bsb": value}, content_type="application/json")

    assert response.status_code == 400
    assert "bank_bsb" in response.json()


def test_an_account_number_with_letters_in_it_is_refused(client, dealer):
    client.sign_in(dealer.user)

    response = client.patch(
        URL, {"bank_account_number": "12345A"}, content_type="application/json"
    )

    assert response.status_code == 400


def test_the_signature_image_goes_through_the_upload_pipeline(api_client, dealer):
    api_client.force_authenticate(user=dealer.user)

    response = api_client.patch(
        URL,
        {"signature_image": SimpleUploadedFile("signature.png", PNG, "image/png")},
        format="multipart",
    )

    assert response.status_code == 200
    assert response.json()["signature_image_uploaded"] is True


def test_a_file_that_is_not_what_it_claims_is_refused(api_client, dealer):
    """Sniffed by bytes rather than trusted by name. Nothing new — the same
    pipeline as every other document in the product."""
    api_client.force_authenticate(user=dealer.user)

    response = api_client.patch(
        URL,
        {"signature_image": SimpleUploadedFile("signature.png", b"not a png", "image/png")},
        format="multipart",
    )

    assert response.status_code == 400


def test_bank_details_stay_editable_while_onboarding_is_under_review(client, dealer):
    """The onboarding lock protects the verification evidence somebody is
    reading. A bank account a dealer needs to correct is not that."""
    DealerProfile.objects.create(
        dealer=dealer, onboarding_status=DealerProfile.OnboardingStatus.SUBMITTED
    )
    client.sign_in(dealer.user)

    response = client.patch(
        URL, {"bank_account_name": "Corrected Name"}, content_type="application/json"
    )

    assert response.status_code == 200


def test_an_anonymous_caller_is_refused(client):
    assert client.get(URL).status_code == 401
