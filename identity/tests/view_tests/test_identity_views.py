"""Identity verification, end to end.

Three things this file exists to hold: that the gate stays shut until all three
images are approved, that a rejection clears one image and keeps the others, and
that a photograph of a stranger's driver's licence is reachable by exactly two
parties and nobody else.
"""

import pytest
from django.core.files.base import ContentFile
from django.urls import reverse

from dealers.models import Dealer
from identity.models import Verification
from sales.models import Sale, SaleEvent
from sales.tests.factories import SaleFactory
from sales.utils.access import cookie_name

pytestmark = pytest.mark.django_db

# A real 1x1 PNG. The upload pipeline parses the file rather than trusting its
# name, so a stub of arbitrary bytes would be rejected and prove nothing.
PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06"
    b"\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05"
    b"\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
)


def upload_url(sale, side):
    return reverse("sale-identity-upload", kwargs={"reference": sale.reference, "side": side})


def submit_url(sale):
    return reverse("sale-identity-submit", kwargs={"reference": sale.reference})


def customer_image_url(sale, side):
    return reverse("sale-identity-image", kwargs={"reference": sale.reference, "side": side})


def dealer_image_url(sale, side):
    return reverse(
        "dealer-sale-identity-image", kwargs={"reference": sale.reference, "side": side}
    )


def review_url(sale, side):
    return reverse(
        "dealer-sale-identity-review", kwargs={"reference": sale.reference, "side": side}
    )


def sent_sale(dealer, **overrides):
    defaults = {
        "produces": Dealer.Plan.COMPLETE,
        "status": Sale.Status.AWAITING_CUSTOMER,
        "vehicle_price": 4500,
        "customer_name": "Alex Tran",
        "customer_email": "alex@example.com",
    }
    return SaleFactory(dealer=dealer, **{**defaults, **overrides})


def hold_cookie(client, sale):
    client.cookies[cookie_name(sale.reference)] = sale.access_token
    return client


def png(name="licence.png"):
    from django.core.files.uploadedfile import SimpleUploadedFile

    return SimpleUploadedFile(name, PNG, "image/png")


def upload_all(api_client, sale):
    """Put all three images on a sale, through the real endpoint."""
    api_client.cookies[cookie_name(sale.reference)] = sale.access_token
    for side in Verification.SIDES:
        api_client.post(upload_url(sale, side), {"image": png()}, format="multipart")
    return Verification.all_objects.get(sale=sale)


def verification(sale):
    return Verification.all_objects.get(sale=sale)


# --- uploading --------------------------------------------------------------


def test_the_customer_sends_one_photo(api_client, selling_dealer):
    sale = sent_sale(selling_dealer)
    api_client.cookies[cookie_name(sale.reference)] = sale.access_token

    response = api_client.post(upload_url(sale, "front"), {"image": png()}, format="multipart")

    assert response.status_code == 200
    row = verification(sale)
    assert row.front_status == Verification.ImageStatus.SUBMITTED
    assert row.front_image
    assert row.dealer == selling_dealer


def test_a_file_that_is_not_an_image_is_refused(api_client, selling_dealer):
    """Sniffed by bytes, not trusted by name. The same pipeline as every other
    upload in the product."""
    from django.core.files.uploadedfile import SimpleUploadedFile

    sale = sent_sale(selling_dealer)
    api_client.cookies[cookie_name(sale.reference)] = sale.access_token

    response = api_client.post(
        upload_url(sale, "front"),
        {"image": SimpleUploadedFile("licence.png", b"<script>not a png</script>", "image/png")},
        format="multipart",
    )

    assert response.status_code == 400


def test_a_pdf_is_refused_even_though_the_pipeline_allows_one(api_client, selling_dealer):
    """A PDF of a driver's licence is a thing somebody made rather than a thing
    they took, and the dealer is being asked to look at a photograph."""
    from django.core.files.uploadedfile import SimpleUploadedFile

    sale = sent_sale(selling_dealer)
    api_client.cookies[cookie_name(sale.reference)] = sale.access_token
    pdf = SimpleUploadedFile(
        "licence.pdf",
        b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        b"2 0 obj<</Type/Pages/Count 0/Kids[]>>endobj\ntrailer<</Root 1 0 R>>",
        "application/pdf",
    )

    assert api_client.post(
        upload_url(sale, "front"), {"image": pdf}, format="multipart"
    ).status_code == 400


def test_an_unknown_side_is_refused(api_client, selling_dealer):
    sale = sent_sale(selling_dealer)
    api_client.cookies[cookie_name(sale.reference)] = sale.access_token

    response = api_client.post(
        upload_url(sale, "elbow"), {"image": png()}, format="multipart"
    )

    assert response.status_code == 409


def test_uploading_without_the_cookie_is_refused(api_client, selling_dealer):
    sale = sent_sale(selling_dealer)

    response = api_client.post(upload_url(sale, "front"), {"image": png()}, format="multipart")

    assert response.status_code == 403
    assert not Verification.all_objects.filter(sale=sale).exists()


def test_an_upload_is_recorded_against_the_sale(api_client, selling_dealer):
    sale = sent_sale(selling_dealer)
    api_client.cookies[cookie_name(sale.reference)] = sale.access_token

    api_client.post(upload_url(sale, "front"), {"image": png()}, format="multipart")

    event = SaleEvent.objects.for_sale(sale).get(kind="identity.uploaded")
    assert event.actor is None
    assert event.actor_label == "Alex Tran (customer)"
    assert event.context["side"] == "front"


# --- submitting -------------------------------------------------------------


def test_submitting_needs_all_three(api_client, selling_dealer):
    sale = sent_sale(selling_dealer)
    api_client.cookies[cookie_name(sale.reference)] = sale.access_token
    api_client.post(upload_url(sale, "front"), {"image": png()}, format="multipart")

    response = api_client.post(submit_url(sale))

    assert response.status_code == 409
    sale.refresh_from_db()
    assert sale.status == Sale.Status.AWAITING_CUSTOMER


def test_submitting_hands_the_sale_to_the_dealer(api_client, selling_dealer):
    """`awaiting_identity_review` exists only while identity is manual, which is
    why it is a state rather than a flag on the one before it."""
    sale = sent_sale(selling_dealer)
    upload_all(api_client, sale)

    response = api_client.post(submit_url(sale))

    assert response.status_code == 200
    sale.refresh_from_db()
    assert sale.status == Sale.Status.AWAITING_IDENTITY_REVIEW
    assert verification(sale).status == Verification.Status.SUBMITTED


# --- reviewing --------------------------------------------------------------


def test_the_gate_stays_shut_until_all_three_are_approved(client, api_client, selling_dealer):
    sale = sent_sale(selling_dealer)
    upload_all(api_client, sale)
    api_client.post(submit_url(sale))
    client.sign_in(selling_dealer.user)

    for side in ("front", "back"):
        client.post(review_url(sale, side), {"approved": True}, content_type="application/json")
        assert verification(sale).is_verified is False
        sale.refresh_from_db()
        assert sale.status == Sale.Status.AWAITING_IDENTITY_REVIEW

    client.post(review_url(sale, "selfie"), {"approved": True}, content_type="application/json")

    row = verification(sale)
    assert row.is_verified is True
    assert row.verified_by == selling_dealer.user
    assert row.verified_at is not None
    sale.refresh_from_db()
    assert sale.status == Sale.Status.READY_TO_SIGN


def test_a_rejection_clears_that_image_and_keeps_the_others(client, api_client, selling_dealer, outbox):
    """A clear licence and an unusable selfie is the ordinary failure, and
    making the customer redo all of it because one photo was blurry is the kind
    of small cruelty that gets a sale abandoned."""
    sale = sent_sale(selling_dealer)
    upload_all(api_client, sale)
    api_client.post(submit_url(sale))
    client.sign_in(selling_dealer.user)
    client.post(review_url(sale, "front"), {"approved": True}, content_type="application/json")

    client.post(
        review_url(sale, "selfie"),
        {"approved": False, "reason": "The photo is too dark to make out your face."},
        content_type="application/json",
    )

    row = verification(sale)
    assert row.selfie_status == Verification.ImageStatus.REJECTED
    assert not row.selfie_image
    assert row.front_status == Verification.ImageStatus.APPROVED
    assert row.front_image
    assert row.back_image
    sale.refresh_from_db()
    assert sale.status == Sale.Status.AWAITING_CUSTOMER


def test_the_rejection_reason_reaches_the_customer_as_a_sentence(
    client, api_client, selling_dealer, outbox
):
    sale = sent_sale(selling_dealer)
    upload_all(api_client, sale)
    api_client.post(submit_url(sale))
    client.sign_in(selling_dealer.user)

    client.post(
        review_url(sale, "back"),
        {"approved": False, "reason": "The expiry date is cut off."},
        content_type="application/json",
    )

    assert len(outbox) == 1
    assert outbox[0].to == "alex@example.com"
    assert "The expiry date is cut off." in outbox[0].body_text
    # It names the one image, not all three.
    assert "the back of your driver's licence" in outbox[0].body_text
    assert "a photo of your face" not in outbox[0].body_text


def test_a_rejection_without_a_reason_is_refused(client, api_client, selling_dealer):
    """"Verification failed" sends the customer back to guess which of three
    photographs was the problem."""
    sale = sent_sale(selling_dealer)
    upload_all(api_client, sale)
    client.sign_in(selling_dealer.user)

    response = client.post(
        review_url(sale, "front"), {"approved": False}, content_type="application/json"
    )

    assert response.status_code == 409
    assert verification(sale).front_image


def test_replacing_a_rejected_image_reopens_the_check(client, api_client, selling_dealer, outbox):
    sale = sent_sale(selling_dealer)
    upload_all(api_client, sale)
    api_client.post(submit_url(sale))
    client.sign_in(selling_dealer.user)
    client.post(
        review_url(sale, "selfie"),
        {"approved": False, "reason": "Too dark."},
        content_type="application/json",
    )

    api_client.post(upload_url(sale, "selfie"), {"image": png()}, format="multipart")

    row = verification(sale)
    assert row.status == Verification.Status.PENDING
    assert row.rejection_reason == ""
    assert row.selfie_reason == ""


def test_a_review_of_nothing_is_refused(client, selling_dealer):
    sale = sent_sale(selling_dealer)
    client.sign_in(selling_dealer.user)

    response = client.post(
        review_url(sale, "front"), {"approved": True}, content_type="application/json"
    )

    assert response.status_code == 409


def test_approving_and_rejecting_are_both_recorded(client, api_client, selling_dealer, outbox):
    sale = sent_sale(selling_dealer)
    upload_all(api_client, sale)
    client.sign_in(selling_dealer.user)

    client.post(review_url(sale, "front"), {"approved": True}, content_type="application/json")
    client.post(
        review_url(sale, "back"),
        {"approved": False, "reason": "Blurry."},
        content_type="application/json",
    )

    kinds = set(SaleEvent.objects.for_sale(sale).values_list("kind", flat=True))
    assert "identity.approved" in kinds
    assert "identity.rejected" in kinds
    rejection = SaleEvent.objects.for_sale(sale).get(kind="identity.rejected")
    assert rejection.actor == selling_dealer.user
    assert rejection.context["reason"] == "Blurry."


# --- who may look at the photographs ----------------------------------------


def test_the_owning_dealer_can_open_the_image(client, api_client, selling_dealer):
    sale = sent_sale(selling_dealer)
    upload_all(api_client, sale)
    client.sign_in(selling_dealer.user)

    response = client.get(dealer_image_url(sale, "front"))

    assert response.status_code == 200
    assert response["X-Content-Type-Options"] == "nosniff"
    assert b"".join(response.streaming_content).startswith(b"\x89PNG")


def test_the_owning_customer_can_open_their_own_image(client, api_client, selling_dealer):
    sale = sent_sale(selling_dealer)
    upload_all(api_client, sale)
    hold_cookie(client, sale)

    assert client.get(customer_image_url(sale, "front")).status_code == 200


def test_another_dealer_cannot_open_it(client, api_client, selling_dealer, rival_dealer):
    sale = sent_sale(selling_dealer)
    upload_all(api_client, sale)
    client.sign_in(rival_dealer.user)

    assert client.get(dealer_image_url(sale, "front")).status_code == 404


def test_a_stranger_cannot_open_it(client, api_client, selling_dealer):
    """The files sit outside MEDIA_ROOT precisely so no webserver will hand them
    out, which makes these views the entire access-control story."""
    sale = sent_sale(selling_dealer)
    upload_all(api_client, sale)

    assert client.get(dealer_image_url(sale, "front")).status_code == 401
    assert client.get(customer_image_url(sale, "front")).status_code == 403


def test_a_customer_holding_another_sales_cookie_cannot_open_it(client, api_client, selling_dealer):
    mine = sent_sale(selling_dealer)
    theirs = sent_sale(selling_dealer)
    upload_all(api_client, theirs)
    client.cookies[cookie_name(theirs.reference)] = mine.access_token

    assert client.get(customer_image_url(theirs, "front")).status_code == 403


def test_another_dealer_cannot_review_it(client, api_client, selling_dealer, rival_dealer):
    sale = sent_sale(selling_dealer)
    upload_all(api_client, sale)
    client.sign_in(rival_dealer.user)

    response = client.post(
        review_url(sale, "front"), {"approved": True}, content_type="application/json"
    )

    assert response.status_code == 404
    assert verification(sale).front_status == Verification.ImageStatus.SUBMITTED


# --- what the two screens read ----------------------------------------------


def test_both_sides_read_the_same_identity_block(client, api_client, selling_dealer):
    sale = sent_sale(selling_dealer)
    upload_all(api_client, sale)
    hold_cookie(client, sale)
    customer_block = client.get(
        reverse("sale-overview", kwargs={"reference": sale.reference})
    ).json()["identity"]

    client.cookies.clear()
    client.sign_in(selling_dealer.user)
    dealer_block = client.get(
        reverse("dealer-sale-detail", kwargs={"reference": sale.reference})
    ).json()["identity"]

    assert customer_block == dealer_block


def test_a_sale_with_no_uploads_still_renders_a_checklist(client, selling_dealer):
    """A screen that has to branch on null before it can render a checklist is a
    screen that renders the checklist twice."""
    sale = sent_sale(selling_dealer)
    hold_cookie(client, sale)

    block = client.get(
        reverse("sale-overview", kwargs={"reference": sale.reference})
    ).json()["identity"]

    assert block["is_verified"] is False
    assert len(block["images"]) == 3
    assert len(block["outstanding"]) == 3


def test_verification_gates_the_requirements_engine(client, api_client, selling_dealer):
    sale = sent_sale(
        selling_dealer,
        fulfilment_method=Sale.Fulfilment.PICKUP,
        licence_family_name="Tran",
        licence_given_names="Alex",
        licence_number="1234567",
        licence_date_of_birth="1990-11-05",
        licensee_address_line1="12 Example Street",
        licensee_suburb="Fremantle",
        licensee_postcode="6160",
    )
    upload_all(api_client, sale)
    hold_cookie(client, sale)
    overview = reverse("sale-overview", kwargs={"reference": sale.reference})

    before = client.get(overview).json()["requirements"]
    assert before["identity_verified"] is False
    assert before["next_action"] == "verify"

    client.cookies.clear()
    client.sign_in(selling_dealer.user)
    for side in Verification.SIDES:
        client.post(review_url(sale, side), {"approved": True}, content_type="application/json")

    client.cookies.clear()
    hold_cookie(client, sale)
    after = client.get(overview).json()["requirements"]
    assert after["identity_verified"] is True
    assert after["next_action"] == "sign"
