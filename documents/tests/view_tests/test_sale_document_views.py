"""Downloading a sale's documents from the dealer portal."""

from datetime import date

import pytest
from django.core.files.base import ContentFile
from django.urls import reverse

from dealers.models import Dealer
from dealers.tests.factories import DealerProfileFactory
from documents.models import FormTemplate, SaleDocument
from documents.tests.factories import FormTemplateFactory, load_current_templates
from sales.models import Sale
from sales.tests.factories import SaleFactory

pytestmark = pytest.mark.django_db


def document_url(sale, kind, **query):
    url = reverse("dealer-sale-document", kwargs={"reference": sale.reference, "kind": kind})
    if query:
        url += "?" + "&".join(f"{key}={value}" for key, value in query.items())
    return url


def warranty_url(sale):
    return reverse("dealer-sale-warranty-notice", kwargs={"reference": sale.reference})


@pytest.fixture
def trading_dealer(selling_dealer):
    DealerProfileFactory(
        dealer=selling_dealer,
        legal_name="Bikes WA Pty Ltd",
        dealer_licence_number="MD12345",
        organisation_code="ORG999",
        address_line1="1 Trade Way",
        suburb="Osborne Park",
        postcode="6017",
        authorised_officer_name="Sam Lee",
        authorised_officer_licence_number="7654321",
        authorised_officer_date_of_birth=date(1980, 2, 3),
        declared_at="Osborne Park",
    )
    return selling_dealer


def priced_sale(dealer, **overrides):
    defaults = {
        "produces": Dealer.Plan.COMPLETE,
        "vehicle_price": 4500,
    }
    sale = SaleFactory(
        dealer=dealer,
        **{**defaults, **overrides},
        licence_family_name="Tran",
        licence_given_names="Alex",
        licence_number="1234567",
        licence_date_of_birth=date(1990, 11, 5),
        licensee_address_line1="12 Example Street",
        licensee_suburb="Fremantle",
        licensee_postcode="6160",
    )
    sale.apply_pricing()
    sale.save(update_fields=["balance_amount"])
    return sale


# --- the documents ----------------------------------------------------------


def test_the_dealer_downloads_an_unsigned_contract(client, trading_dealer):
    sale = priced_sale(trading_dealer)
    client.sign_in(trading_dealer.user)

    response = client.get(document_url(sale, SaleDocument.Kind.SALE_CONTRACT))

    assert response.status_code == 200
    assert response["Content-Type"] == "application/pdf"
    assert response["X-Content-Type-Options"] == "nosniff"
    assert response.content.startswith(b"%PDF")


def test_an_unsigned_document_is_not_written_to_disk(client, trading_dealer):
    """A filled form carries a licence number and a date of birth. Writing one
    to disk creates a file nobody asked for and nothing deletes."""
    sale = priced_sale(trading_dealer)
    client.sign_in(trading_dealer.user)

    client.get(document_url(sale, SaleDocument.Kind.SALE_CONTRACT))

    assert not SaleDocument.all_objects.filter(sale=sale).exists()


def test_a_document_this_sale_does_not_produce_is_not_found(client, trading_dealer):
    sale = priced_sale(trading_dealer, produces=Dealer.Plan.CONTRACTS)
    client.sign_in(trading_dealer.user)

    assert client.get(document_url(sale, SaleDocument.Kind.LICENSING_FORM)).status_code == 404


def test_an_unpriced_sale_is_told_to_set_a_price(client, trading_dealer):
    """A form quoting no price is not worth reading, and this is the dealer's to
    fix — so it answers with a sentence rather than failing."""
    sale = SaleFactory(dealer=trading_dealer, produces=Dealer.Plan.COMPLETE, vehicle_price=None)
    client.sign_in(trading_dealer.user)

    response = client.get(document_url(sale, SaleDocument.Kind.SALE_CONTRACT))

    assert response.status_code == 409
    assert "price" in response.json()["detail"]


def test_a_missing_template_is_reported_as_unavailable_rather_than_as_a_bug(client, trading_dealer):
    sale = priced_sale(trading_dealer)
    client.sign_in(trading_dealer.user)

    response = client.get(document_url(sale, SaleDocument.Kind.LICENSING_FORM))

    assert response.status_code == 503


def test_another_dealers_sale_is_not_found(client, trading_dealer, rival_dealer):
    theirs = priced_sale(rival_dealer)
    client.sign_in(trading_dealer.user)

    assert client.get(document_url(theirs, SaleDocument.Kind.SALE_CONTRACT)).status_code == 404


def test_an_anonymous_caller_cannot_render_a_document(client, trading_dealer):
    """The render endpoint is real CPU as well as a licence number, so it is not
    somewhere to be generous about who may call."""
    sale = priced_sale(trading_dealer)

    assert client.get(document_url(sale, SaleDocument.Kind.SALE_CONTRACT)).status_code == 401


# --- the signed copy --------------------------------------------------------


def test_the_signed_copy_is_served_from_the_private_tree(client, trading_dealer):
    sale = priced_sale(trading_dealer)
    SaleDocument.objects.create_for(
        trading_dealer,
        sale=sale,
        kind=SaleDocument.Kind.SALE_CONTRACT,
        file=ContentFile(b"%PDF-1.4 signed", name="contract.pdf"),
        signer_name="Alex Tran",
    )
    client.sign_in(trading_dealer.user)

    response = client.get(
        document_url(sale, SaleDocument.Kind.SALE_CONTRACT, version="signed")
    )

    assert response.status_code == 200
    assert b"".join(response.streaming_content) == b"%PDF-1.4 signed"


def test_asking_for_a_signed_copy_that_does_not_exist_says_so(client, trading_dealer):
    sale = priced_sale(trading_dealer)
    client.sign_in(trading_dealer.user)

    response = client.get(
        document_url(sale, SaleDocument.Kind.SALE_CONTRACT, version="signed")
    )

    assert response.status_code == 404
    assert "signed" in response.json()["detail"]


def test_another_dealers_signed_document_is_not_reachable(client, trading_dealer, rival_dealer):
    theirs = priced_sale(rival_dealer)
    SaleDocument.objects.create_for(
        rival_dealer,
        sale=theirs,
        kind=SaleDocument.Kind.SALE_CONTRACT,
        file=ContentFile(b"%PDF-1.4 theirs", name="contract.pdf"),
    )
    client.sign_in(trading_dealer.user)

    response = client.get(
        document_url(theirs, SaleDocument.Kind.SALE_CONTRACT, version="signed")
    )

    assert response.status_code == 404


# --- the warranty notice ----------------------------------------------------


def test_the_warranty_notice_serves_the_form_the_test_selects(client, trading_dealer):
    load_current_templates()
    sale = priced_sale(trading_dealer, condition=Sale.Condition.USED, year=2024, odometer_km=9000)
    client.sign_in(trading_dealer.user)

    response = client.get(warranty_url(sale))

    assert response.status_code == 200
    assert response["Content-Type"] == "application/pdf"
    assert "form_5a_motorcycle" in response["Content-Disposition"]


def test_failing_the_test_serves_form_6(client, trading_dealer):
    load_current_templates()
    sale = priced_sale(
        trading_dealer, condition=Sale.Condition.USED, vehicle_price=1500, year=2024, odometer_km=9000
    )
    client.sign_in(trading_dealer.user)

    response = client.get(warranty_url(sale))

    assert "form_6" in response["Content-Disposition"]


def test_new_stock_has_no_prescribed_warranty_form(client, trading_dealer):
    load_current_templates()
    sale = priced_sale(trading_dealer, condition=Sale.Condition.NEW, odometer_km=None)
    client.sign_in(trading_dealer.user)

    assert client.get(warranty_url(sale)).status_code == 404


def test_the_warranty_notice_refuses_rather_than_substituting(client, trading_dealer):
    """Reg 7 requires a statement *in the form of* Form 5A or Form 6. There is
    nothing to substitute, and a quiet omission would leave the dealer not
    having complied without knowing it."""
    sale = priced_sale(trading_dealer, condition=Sale.Condition.USED)
    client.sign_in(trading_dealer.user)

    assert client.get(warranty_url(sale)).status_code == 503


def test_another_dealers_warranty_notice_is_not_found(client, trading_dealer, rival_dealer):
    load_current_templates()
    theirs = priced_sale(rival_dealer, condition=Sale.Condition.USED)
    client.sign_in(trading_dealer.user)

    assert client.get(warranty_url(theirs)).status_code == 404


# --- what the sale page reads -----------------------------------------------


def test_the_sale_payload_lists_what_this_sale_produces(client, trading_dealer):
    sale = priced_sale(trading_dealer)
    client.sign_in(trading_dealer.user)

    payload = client.get(
        reverse("dealer-sale-detail", kwargs={"reference": sale.reference})
    ).json()

    kinds = [row["kind"] for row in payload["documents"]]
    assert kinds == ["sale_contract", "licensing_form"]
    assert all(row["signed"] is False for row in payload["documents"])


def test_a_signed_document_that_predates_an_edit_is_reported_as_stale(client, trading_dealer):
    """Derived, never stored. A flag can fall out of step with the edit that set
    it; a comparison cannot."""
    sale = priced_sale(trading_dealer)
    SaleDocument.objects.create_for(
        trading_dealer,
        sale=sale,
        kind=SaleDocument.Kind.SALE_CONTRACT,
        file=ContentFile(b"%PDF-1.4 signed", name="contract.pdf"),
        signer_name="Alex Tran",
    )
    client.sign_in(trading_dealer.user)
    detail = reverse("dealer-sale-detail", kwargs={"reference": sale.reference})

    before = client.get(detail).json()["documents"][0]
    assert before["signed"] is True
    assert before["is_stale"] is False

    client.patch(detail, {"vehicle_price": "4900.00"}, content_type="application/json")

    after = client.get(detail).json()["documents"][0]
    assert after["is_stale"] is True


def test_the_sale_payload_carries_the_warranty_verdict(client, trading_dealer):
    sale = priced_sale(trading_dealer, condition=Sale.Condition.USED, year=2024, odometer_km=9000)
    client.sign_in(trading_dealer.user)

    warranty = client.get(
        reverse("dealer-sale-detail", kwargs={"reference": sale.reference})
    ).json()["warranty"]

    assert warranty["kind"] == FormTemplate.Kind.FORM_5A_MOTORCYCLE
    assert warranty["acknowledged"] is False
    assert warranty["acknowledgement_key"]


def test_one_current_version_per_kind_survives_a_second_being_made_current():
    """MySQL will not enforce a unique constraint with a condition, so this is
    enforced in code — and this is the test that says so."""
    first = FormTemplateFactory(kind=FormTemplate.Kind.VL17, version_label="2020-01-01")
    second = FormTemplateFactory(
        kind=FormTemplate.Kind.VL17, version_label="2021-01-01", is_current=False
    )

    second.make_current()

    first.refresh_from_db()
    assert first.is_current is False
    assert FormTemplate.current(FormTemplate.Kind.VL17) == second
