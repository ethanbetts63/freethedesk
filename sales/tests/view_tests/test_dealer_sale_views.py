"""The dealer's sale API, at the request layer.

The cross-tenant tests are the point of this file. `core.models.tenancy` makes
an unscoped query raise, which catches the developer who forgets; these catch
the one who scopes to the wrong dealer, which the manager cannot see. Every list
and every detail endpoint gets one, as a standing pattern rather than a one-off
— see `_docs/licensing/plan/03-data-model.md`.
"""

import pytest
from django.urls import reverse

from dealers.models import Dealer
from sales.models import Sale, SaleEvent
from sales.tests.factories import SaleFactory

pytestmark = pytest.mark.django_db

LIST = reverse("dealer-sale-list")


def detail(sale):
    return reverse("dealer-sale-detail", kwargs={"reference": sale.reference})


VALID_SALE = {
    "condition": "used",
    "make": "Honda",
    "model_name": "CB125F",
    "year": 2021,
    "odometer_km": 12000,
    "vin": "JH2JC61A0MK000001",
    "vehicle_price": "4500.00",
    "delivery_fee": "150.00",
    "deposit_amount": "500.00",
    "customer_name": "Alex Tran",
    "customer_email": "alex@example.com",
    "customer_phone": "0400 222 333",
    "fulfilment_method": "delivery",
    "delivery_address_line1": "12 Example Street",
    "delivery_suburb": "Fremantle",
    "delivery_state": "WA",
    "delivery_postcode": "6160",
}


def post_sale(client, **overrides):
    return client.post(LIST, {**VALID_SALE, **overrides}, content_type="application/json")


# --- who may call at all ----------------------------------------------------


def test_an_anonymous_caller_is_refused(client):
    assert client.get(LIST).status_code == 401


def test_a_signed_in_user_with_no_dealership_is_refused(client, selling_dealer):
    from core.tests.factories import UserFactory

    client.sign_in(UserFactory(username="nobody@example.com"))
    assert client.get(LIST).status_code == 403


@pytest.mark.parametrize(
    "field,value",
    [
        ("status", Dealer.Status.PENDING),
        ("status", Dealer.Status.SUSPENDED),
        ("payment_status", Dealer.PaymentStatus.PAST_DUE),
    ],
)
def test_a_dealership_not_cleared_to_trade_is_refused(client, selling_dealer, field, value):
    """A suspended or unpaid dealership must not keep producing paperwork in a
    customer's name, which is a different question from whether it can sign in."""
    setattr(selling_dealer, field, value)
    selling_dealer.save(update_fields=[field])
    client.sign_in(selling_dealer.user)

    assert client.get(LIST).status_code == 403


# --- creating ---------------------------------------------------------------


def test_a_dealer_creates_a_sale(client, selling_dealer):
    client.sign_in(selling_dealer.user)

    response = post_sale(client)

    assert response.status_code == 201, response.json()
    payload = response.json()
    assert payload["reference"].startswith("S-")
    assert payload["status"] == "draft"
    sale = Sale.all_objects.get(reference=payload["reference"])
    assert sale.dealer == selling_dealer
    assert sale.created_by == selling_dealer.user


def test_the_plan_is_snapshotted_onto_the_sale(client, selling_dealer):
    """Changing plan mid-sale must not rewrite the document set underneath a
    customer who is halfway through signing."""
    selling_dealer.plan = Dealer.Plan.LICENSING
    selling_dealer.save(update_fields=["plan"])
    client.sign_in(selling_dealer.user)

    reference = post_sale(client).json()["reference"]

    selling_dealer.plan = Dealer.Plan.COMPLETE
    selling_dealer.save(update_fields=["plan"])

    assert Sale.all_objects.get(reference=reference).produces == "licensing"


def test_the_dealer_cannot_choose_which_dealership_a_sale_belongs_to(client, selling_dealer, rival_dealer):
    """A dealer id in the body is ignored rather than honoured — there is
    nowhere to put one, and this is the test that keeps it that way."""
    client.sign_in(selling_dealer.user)

    response = post_sale(client, dealer=rival_dealer.pk, produces="contracts")

    assert response.status_code == 201
    sale = Sale.all_objects.get(reference=response.json()["reference"])
    assert sale.dealer == selling_dealer
    assert sale.produces == selling_dealer.plan


def test_the_balance_is_computed_rather_than_supplied(client, selling_dealer):
    client.sign_in(selling_dealer.user)

    payload = post_sale(client, balance_amount="1.00").json()

    # 4500 + 150 - 500
    assert payload["total_amount"] == "4650.00"
    assert payload["balance_amount"] == "4150.00"


def test_a_half_typed_draft_saves(client, selling_dealer):
    """A dealer keying a sale in a showroom saves and comes back. Completeness
    is the send step's gate, not this one's."""
    client.sign_in(selling_dealer.user)

    response = client.post(LIST, {"make": "Yamaha"}, content_type="application/json")

    assert response.status_code == 201, response.json()


@pytest.mark.parametrize(
    "overrides,field",
    [
        ({"condition": "new", "odometer_km": 40}, "odometer_km"),
        ({"condition": "new", "registration_expiry": "2027-01-01"}, "registration_expiry"),
        ({"condition": "used", "registration_months_included": 12}, "registration_months_included"),
        ({"is_electric": True, "engine_capacity_cc": 125}, "engine_capacity_cc"),
        ({"fulfilment_method": "pickup"}, "delivery_address_line1"),
        ({"licensed_to_company": False, "company_name": "Acme Pty Ltd"}, "company_name"),
        (
            {"purchaser_is_licence_holder": True, "purchaser_family_name": "Tran"},
            "purchaser_family_name",
        ),
    ],
)
def test_a_combination_that_cannot_be_true_at_once_is_refused(
    client, selling_dealer, overrides, field
):
    """These are the errors that print a wrong document rather than an
    incomplete one, which is why they are refused and missing fields are not."""
    client.sign_in(selling_dealer.user)

    response = post_sale(client, **overrides)

    assert response.status_code == 400
    assert field in response.json()


# --- reading ----------------------------------------------------------------


def test_the_queue_lists_only_this_dealers_sales(client, selling_dealer, rival_dealer):
    mine = SaleFactory(dealer=selling_dealer, customer_name="Alex Tran")
    SaleFactory(dealer=rival_dealer, customer_name="Jo Blake")
    client.sign_in(selling_dealer.user)

    payload = client.get(LIST).json()

    assert payload["count"] == 1
    assert [row["reference"] for row in payload["results"]] == [mine.reference]


def test_a_sale_belonging_to_another_dealer_is_not_found(client, selling_dealer, rival_dealer):
    """404 rather than 403: telling a stranger that a reference exists but is
    not theirs is a fact about another dealership's business."""
    theirs = SaleFactory(dealer=rival_dealer)
    client.sign_in(selling_dealer.user)

    assert client.get(detail(theirs)).status_code == 404


def test_a_sale_belonging_to_another_dealer_cannot_be_edited(client, selling_dealer, rival_dealer):
    theirs = SaleFactory(dealer=rival_dealer, customer_name="Jo Blake")
    client.sign_in(selling_dealer.user)

    response = client.patch(
        detail(theirs), {"customer_name": "Taken Over"}, content_type="application/json"
    )

    assert response.status_code == 404
    theirs.refresh_from_db()
    assert theirs.customer_name == "Jo Blake"


def test_the_queue_row_says_who_it_is_waiting_on(client, selling_dealer):
    SaleFactory(dealer=selling_dealer, status=Sale.Status.SIGNED)
    client.sign_in(selling_dealer.user)

    row = client.get(LIST).json()["results"][0]

    assert row["waiting_on"] == "dealer"
    assert row["waiting_for"] == "Approve and sign"


def test_the_queue_row_carries_no_personal_detail(client, selling_dealer):
    """A table of forty rows has no reason to ship forty licence numbers to a
    browser, and the detail serializer would."""
    SaleFactory(dealer=selling_dealer, licence_number="1234567", licence_date_of_birth="1990-11-05")
    client.sign_in(selling_dealer.user)

    row = client.get(LIST).json()["results"][0]

    assert "licence_number" not in row
    assert "licence_date_of_birth" not in row


def test_needs_action_filters_to_the_dealers_own_queue(client, selling_dealer):
    SaleFactory(dealer=selling_dealer, status=Sale.Status.SIGNED)
    SaleFactory(dealer=selling_dealer, status=Sale.Status.AWAITING_CUSTOMER)
    client.sign_in(selling_dealer.user)

    payload = client.get(f"{LIST}?needs_action=true").json()

    assert payload["count"] == 1
    assert payload["results"][0]["status"] == "signed"


def test_search_finds_a_sale_by_reference_and_by_vehicle(client, selling_dealer):
    sale = SaleFactory(dealer=selling_dealer, make="Honda", model_name="CB125F")
    SaleFactory(dealer=selling_dealer, make="Yamaha", model_name="MT-07")
    client.sign_in(selling_dealer.user)

    assert client.get(f"{LIST}?search=Honda").json()["count"] == 1
    assert client.get(f"{LIST}?search={sale.reference}").json()["count"] == 1


def test_search_does_not_reach_across_dealers(client, selling_dealer, rival_dealer):
    SaleFactory(dealer=rival_dealer, customer_name="Findable Person")
    client.sign_in(selling_dealer.user)

    assert client.get(f"{LIST}?search=Findable").json()["count"] == 0


def test_the_detail_page_carries_the_whole_sale(client, selling_dealer):
    sale = SaleFactory(dealer=selling_dealer, licence_number="1234567")
    client.sign_in(selling_dealer.user)

    payload = client.get(detail(sale)).json()

    assert payload["reference"] == sale.reference
    assert payload["licence_number"] == "1234567"
    assert payload["vehicle"] == "2021 Honda CB125F"
    assert payload["status_label"] == "Draft"


# --- editing ----------------------------------------------------------------


def test_a_dealer_edits_their_own_sale(client, selling_dealer):
    sale = SaleFactory(dealer=selling_dealer)
    client.sign_in(selling_dealer.user)

    response = client.patch(
        detail(sale), {"customer_phone": "0411 999 888"}, content_type="application/json"
    )

    assert response.status_code == 200
    sale.refresh_from_db()
    assert sale.customer_phone == "0411 999 888"


def test_editing_a_printed_field_makes_the_paperwork_stale(client, selling_dealer):
    sale = SaleFactory(dealer=selling_dealer)
    assert sale.details_updated_at is None
    client.sign_in(selling_dealer.user)

    client.patch(detail(sale), {"vehicle_price": "4900.00"}, content_type="application/json")

    sale.refresh_from_db()
    assert sale.details_updated_at is not None
    assert sale.balance_amount == sale.total_amount - sale.deposit_amount


def test_saving_a_field_at_its_current_value_does_not_make_anything_stale(client, selling_dealer):
    """Stamping on every save would make every document permanently stale."""
    sale = SaleFactory(dealer=selling_dealer, customer_phone="0400 222 333")
    client.sign_in(selling_dealer.user)

    client.patch(
        detail(sale), {"customer_phone": "0400 222 333"}, content_type="application/json"
    )

    sale.refresh_from_db()
    assert sale.details_updated_at is None


def test_the_status_cannot_be_moved_by_editing_the_sale(client, selling_dealer):
    """State changes go through the transitions module, which records who did
    it. A writable status column would be a second, unaudited way to move one."""
    sale = SaleFactory(dealer=selling_dealer)
    client.sign_in(selling_dealer.user)

    client.patch(detail(sale), {"status": "completed"}, content_type="application/json")

    sale.refresh_from_db()
    assert sale.status == Sale.Status.DRAFT


def test_the_reference_cannot_be_rewritten(client, selling_dealer):
    sale = SaleFactory(dealer=selling_dealer)
    original = sale.reference
    client.sign_in(selling_dealer.user)

    client.patch(detail(sale), {"reference": "S-OVERWRITE"}, content_type="application/json")

    sale.refresh_from_db()
    assert sale.reference == original


def test_a_delete_is_not_offered(client, selling_dealer):
    """The audit trail is the product. Nothing in the application removes a
    sale, so the route does not answer to a delete."""
    sale = SaleFactory(dealer=selling_dealer)
    client.sign_in(selling_dealer.user)

    assert client.delete(detail(sale)).status_code == 405


# --- sending it to the customer ---------------------------------------------


def send_url(sale):
    return reverse("dealer-sale-send", kwargs={"reference": sale.reference})


COMPLETE_ENOUGH_TO_SEND = {
    "condition": Sale.Condition.USED,
    "make": "Honda",
    "model_name": "CB125F",
    "vehicle_price": 4500,
    "customer_name": "Alex Tran",
    "customer_email": "alex@example.com",
}


def test_sending_emails_the_link_and_hands_the_sale_over(client, selling_dealer, outbox):
    sale = SaleFactory(dealer=selling_dealer, **COMPLETE_ENOUGH_TO_SEND)
    client.sign_in(selling_dealer.user)

    response = client.post(send_url(sale))

    assert response.status_code == 200
    sale.refresh_from_db()
    assert sale.status == Sale.Status.AWAITING_CUSTOMER
    assert sale.link_sent_at is not None
    assert sale.access_password_hash
    assert len(outbox) == 1
    assert outbox[0].to == "alex@example.com"
    assert sale.reference in outbox[0].body_text


def test_the_password_is_stored_only_as_a_hash(client, selling_dealer, outbox):
    """A password we can read back is one a support conversation can leak."""
    sale = SaleFactory(dealer=selling_dealer, **COMPLETE_ENOUGH_TO_SEND)
    client.sign_in(selling_dealer.user)

    client.post(send_url(sale))

    sale.refresh_from_db()
    assert sale.access_password_hash.startswith("pbkdf2_")
    assert sale.access_password_hash not in outbox[0].body_text


def test_the_email_carries_a_working_link(client, selling_dealer, outbox):
    sale = SaleFactory(dealer=selling_dealer, **COMPLETE_ENOUGH_TO_SEND)
    client.sign_in(selling_dealer.user)

    client.post(send_url(sale))

    sale.refresh_from_db()
    assert f"/sale/{sale.reference}/{sale.access_token}" in outbox[0].body_text


def test_an_incomplete_sale_is_not_sent(client, selling_dealer, outbox):
    """A stranger should not be asked to fill in their licence details against a
    sale that does not yet say what they are buying."""
    sale = SaleFactory(dealer=selling_dealer, customer_email="", vehicle_price=None)
    client.sign_in(selling_dealer.user)

    response = client.post(send_url(sale))

    assert response.status_code == 409
    assert not outbox
    sale.refresh_from_db()
    assert sale.status == Sale.Status.DRAFT


def test_resending_mints_a_new_password_and_keeps_the_same_link(client, selling_dealer, outbox):
    """A customer who already has the link open in a browser must not be locked
    out by the dealer resending it."""
    sale = SaleFactory(dealer=selling_dealer, **COMPLETE_ENOUGH_TO_SEND)
    client.sign_in(selling_dealer.user)
    client.post(send_url(sale))
    sale.refresh_from_db()
    first_hash, token = sale.access_password_hash, sale.access_token

    client.post(send_url(sale))

    sale.refresh_from_db()
    assert sale.access_password_hash != first_hash
    assert sale.access_token == token
    assert sale.status == Sale.Status.AWAITING_CUSTOMER
    assert SaleEvent.objects.for_sale(sale).filter(kind="link.resent").exists()


def test_sending_is_recorded_against_the_sale(client, selling_dealer, outbox):
    sale = SaleFactory(dealer=selling_dealer, **COMPLETE_ENOUGH_TO_SEND)
    client.sign_in(selling_dealer.user)

    client.post(send_url(sale))

    event = SaleEvent.objects.for_sale(sale).get(kind="status.awaiting_customer")
    assert event.actor == selling_dealer.user


def test_another_dealers_sale_cannot_be_sent(client, selling_dealer, rival_dealer, outbox):
    theirs = SaleFactory(dealer=rival_dealer, **COMPLETE_ENOUGH_TO_SEND)
    client.sign_in(selling_dealer.user)

    assert client.post(send_url(theirs)).status_code == 404
    assert not outbox
