"""Producing the documents themselves.

The prescribed forms are checked by reading the values back out of the AcroForm,
which is the only way to know a value reached the box it was meant for rather
than simply that a PDF came out.
"""

import io
from datetime import date

import pytest
from pypdf import PdfReader

from dealers.models import Dealer
from dealers.tests.factories import DealerFactory, DealerProfileFactory
from documents.build import build_unsigned, document_kinds_for
from documents.field_maps import MissingFieldMap, values_for
from documents.models import FormTemplate, SaleDocument
from documents.render.contract import SaleContractError, build_sale_contract
from documents.render.prescribed import TemplateUnavailable, form_kind_for
from documents.tests.factories import FormTemplateFactory, load_current_templates
from sales.models import Sale
from sales.tests.factories import SaleFactory

pytestmark = pytest.mark.django_db

Kind = SaleDocument.Kind

COMPLETE_CUSTOMER = {
    "licence_family_name": "Tran",
    "licence_given_names": "Alex",
    "licence_number": "1234567",
    "licence_date_of_birth": date(1990, 11, 5),
    "licensee_address_line1": "12 Example Street",
    "licensee_suburb": "Fremantle",
    "licensee_postcode": "6160",
}


@pytest.fixture
def dealership():
    dealer = DealerFactory(plan=Dealer.Plan.COMPLETE)
    dealer.user.email = "sales@bikeswa.example"
    dealer.user.save(update_fields=["email"])
    profile = DealerProfileFactory(
        dealer=dealer,
        legal_name="Bikes WA Pty Ltd",
        dealer_licence_number="MD12345",
        organisation_code="ORG999",
        abn="11222333444",
        address_line1="1 Trade Way",
        suburb="Osborne Park",
        postcode="6017",
        authorised_officer_name="Sam Lee",
        authorised_officer_licence_number="7654321",
        authorised_officer_date_of_birth=date(1980, 2, 3),
        declared_at="Osborne Park",
    )
    return dealer, profile


def priced_sale(dealer, **overrides):
    sale = SaleFactory(
        dealer=dealer,
        produces=dealer.plan,
        vehicle_price=4500,
        **{**COMPLETE_CUSTOMER, **overrides},
    )
    sale.apply_pricing()
    sale.save(update_fields=["balance_amount"])
    return sale


def form_values(pdf_bytes):
    return {
        name: (field.get("/V") or "")
        for name, field in (PdfReader(io.BytesIO(pdf_bytes)).get_fields() or {}).items()
    }


# --- which documents exist --------------------------------------------------


@pytest.mark.parametrize(
    "plan,expected",
    [
        (Dealer.Plan.LICENSING, {Kind.LICENSING_FORM, Kind.AUTHORITY_TO_LODGE}),
        (Dealer.Plan.CONTRACTS, {Kind.SALE_CONTRACT}),
        (Dealer.Plan.COMPLETE, {Kind.SALE_CONTRACT, Kind.LICENSING_FORM}),
    ],
)
def test_the_document_set_follows_the_plan(dealership, plan, expected):
    dealer, _profile = dealership
    sale = SaleFactory(dealer=dealer, produces=plan)

    assert set(document_kinds_for(sale)) == expected


def test_the_authority_to_lodge_exists_only_where_there_is_no_contract(dealership):
    """It exists to carry SC2 for a dealer who has no contract for SC2 to live
    in. On the complete plan the clause is on the face of the contract, and a
    second instrument saying the same thing would be two authorities to
    reconcile."""
    dealer, _profile = dealership
    complete = SaleFactory(dealer=dealer, produces=Dealer.Plan.COMPLETE)

    assert Kind.AUTHORITY_TO_LODGE not in document_kinds_for(complete)


def test_building_a_document_the_sale_does_not_produce_is_refused(dealership):
    dealer, _profile = dealership
    sale = SaleFactory(dealer=dealer, produces=Dealer.Plan.CONTRACTS)

    with pytest.raises(ValueError):
        build_unsigned(sale, Kind.LICENSING_FORM)


# --- the prescribed forms ---------------------------------------------------


def test_used_stock_gets_mr9b_and_new_stock_gets_vl17(dealership):
    dealer, _profile = dealership

    assert form_kind_for(SaleFactory(dealer=dealer, condition=Sale.Condition.USED)) == "mr9b"
    assert (
        form_kind_for(
            SaleFactory(dealer=dealer, condition=Sale.Condition.NEW, odometer_km=None)
        )
        == "vl17"
    )


def test_vl17_carries_the_customer_and_the_dealer(dealership):
    dealer, _profile = dealership
    load_current_templates()
    sale = priced_sale(dealer, condition=Sale.Condition.NEW, odometer_km=None, year=2026)

    built = build_unsigned(sale, Kind.LICENSING_FORM)
    values = form_values(built.content)

    assert values["FAMILY NAME4"] == "Tran"
    assert values["DRIVERS LICENCE NUMBER6"] == "1234567"
    assert values["BIRTH DATE DAY1"] == "05"
    assert values["SELLER FULL NAME"] == "Sam Lee"
    assert values["ORGANISATION CODE_2"] == "ORG999"
    assert values["CURRENT OR PREVIOUS PLATE NUMBER1"] == "NEW"
    assert values["PURCHASE PRICE"] == "4500.00"
    assert built.template_version


def test_mr9b_carries_the_vehicle_and_the_transfer(dealership):
    dealer, _profile = dealership
    load_current_templates()
    sale = priced_sale(
        dealer,
        condition=Sale.Condition.USED,
        registration="1ABC123",
        engine_number="ENG999",
        odometer_km=12000,
    )

    values = form_values(build_unsigned(sale, Kind.LICENSING_FORM).content)

    assert values["PLATE NUMBER"] == "1ABC123"
    assert values["ENGINE NUMBER"] == "ENG999"
    assert values["ODOMETER READING"] == "12000"
    assert values["DEALER'S LICENCE NUMBER1"] == "MD12345"


def test_a_prescribed_form_never_refuses_on_a_detail_the_sale_does_not_hold(dealership):
    """Both forms stay fillable, so a missing value prints as a blank box
    somebody can write in. Blocking the download only ever moves the problem to
    a counter."""
    dealer, _profile = dealership
    load_current_templates()
    sale = SaleFactory(dealer=dealer, produces=Dealer.Plan.COMPLETE, vehicle_price=4500)

    built = build_unsigned(sale, Kind.LICENSING_FORM)

    assert built.content.startswith(b"%PDF")
    assert form_values(built.content)["DRIVERS LICENCE NUMBER"] == ""


def test_no_signature_or_declaration_date_is_prefilled(dealership):
    """These are statutory declarations. Prefilling saves the customer copying
    details out; signing on their behalf would forge the one act the declaration
    is about."""
    dealer, _profile = dealership
    load_current_templates()
    sale = priced_sale(dealer, condition=Sale.Condition.NEW, odometer_km=None)

    values = form_values(build_unsigned(sale, Kind.LICENSING_FORM).content)

    for field in ("DATE DAY", "DATE MONTH", "DATE YEAR", "DAY DECLARED", "MONTH DECLARED", "YEAR DECLARED"):
        assert values[field] == "", field


def test_generation_refuses_when_the_pinned_version_has_no_field_map(dealership):
    """A reissue that renames a field and is deployed without its map would
    otherwise produce a document with blank boxes, which looks like a customer
    who did not fill something in and gets discovered at a counter."""
    dealer, profile = dealership
    FormTemplateFactory(kind=FormTemplate.Kind.VL17, version_label="2027-01-01")
    sale = priced_sale(dealer, condition=Sale.Condition.NEW, odometer_km=None)

    with pytest.raises(MissingFieldMap) as failure:
        build_unsigned(sale, Kind.LICENSING_FORM)

    assert "2027-01-01" in str(failure.value)


def test_the_error_names_the_versions_that_do_have_a_map(dealership):
    dealer, profile = dealership
    sale = priced_sale(dealer)

    with pytest.raises(MissingFieldMap) as failure:
        values_for("mr9b", "nonsense", sale, dealer, profile)

    assert "Known versions:" in str(failure.value)


def test_generation_refuses_when_no_template_is_loaded_at_all(dealership):
    dealer, _profile = dealership
    sale = priced_sale(dealer)

    with pytest.raises(TemplateUnavailable):
        build_unsigned(sale, Kind.LICENSING_FORM)


def test_the_postal_address_is_the_delivery_address_when_there_is_one(dealership):
    """They are one address, not two, and carrying them separately invites them
    to disagree on a form the customer signs a declaration about."""
    dealer, _profile = dealership
    load_current_templates()
    sale = priced_sale(
        dealer,
        condition=Sale.Condition.NEW,
        odometer_km=None,
        fulfilment_method=Sale.Fulfilment.DELIVERY,
        delivery_address_line1="99 Other Road",
        delivery_suburb="Joondalup",
        delivery_state="WA",
        delivery_postcode="6027",
    )

    values = form_values(build_unsigned(sale, Kind.LICENSING_FORM).content)

    assert values["POSTAL ADDRESS"] == "99 Other Road"
    assert values["RESIDENTIAL ADDRESS_2"] == "12 Example Street"


# --- the contract -----------------------------------------------------------


def test_the_contract_builds(dealership):
    dealer, profile = dealership
    sale = priced_sale(dealer)

    built = build_unsigned(sale, Kind.SALE_CONTRACT)

    assert built.content.startswith(b"%PDF")
    assert built.filename == f"vehicle-sale-contract-{sale.reference}.pdf"
    # It has no template: the regulations are its source, and they change on a
    # slower and different clock from a published form.
    assert built.template_version == ""


def test_the_contract_refuses_without_the_parties_or_the_price(dealership):
    """Unlike the prescribed forms this genuinely refuses. A contract missing
    the parties or the price is not a contract."""
    dealer, profile = dealership
    sale = SaleFactory(dealer=dealer, produces=Dealer.Plan.COMPLETE, vehicle_price=None)

    with pytest.raises(SaleContractError):
        build_sale_contract(sale, dealer, profile)


def test_a_purchaser_buying_for_somebody_else_has_to_be_named(dealership):
    dealer, profile = dealership
    sale = priced_sale(dealer, purchaser_is_licence_holder=False)

    with pytest.raises(SaleContractError):
        build_sale_contract(sale, dealer, profile)


def test_the_contract_leaves_both_signature_lines_blank_until_signed(dealership):
    """Clause 1.1 makes signing the Purchaser's offer, and pre-signing on their
    behalf would forge the one act the clause is about."""
    dealer, profile = dealership
    sale = priced_sale(dealer)

    _filename, unsigned = build_sale_contract(sale, dealer, profile)
    text = extract_text(unsigned)

    assert "Electronically signed by" not in text


def test_a_signed_contract_names_who_signed_it(dealership):
    dealer, profile = dealership
    sale = priced_sale(dealer)

    _filename, signed = build_sale_contract(
        sale, dealer, profile, purchaser_signature="Alex Tran", signed_at=date(2026, 9, 19)
    )

    assert "Electronically signed by Alex Tran" in extract_text(signed)


def test_the_prescribed_terms_are_printed_in_the_contract(dealership):
    dealer, profile = dealership
    sale = priced_sale(dealer)

    text = extract_text(build_sale_contract(sale, dealer, profile)[1])

    assert "an offer has been made to purchase the Vehicle" in text
    assert "automatically lapse at the close of business" in text


def test_trade_in_and_finance_are_marked_not_left_blank(dealership):
    """A blank field on a contract reads as something forgotten."""
    dealer, profile = dealership
    sale = priced_sale(dealer)

    text = extract_text(build_sale_contract(sale, dealer, profile)[1])

    assert "Trade-In Vehicle N/A" in text.replace("\n", " ")
    assert "Finance N/A" in text.replace("\n", " ")


def test_every_page_is_numbered(dealership):
    """A contract that gets separated, printed one-sided or scanned out of order
    has to be reassemblable."""
    dealer, profile = dealership
    sale = priced_sale(dealer)

    _filename, pdf = build_sale_contract(sale, dealer, profile)
    reader = PdfReader(io.BytesIO(pdf))
    total = len(reader.pages)

    assert total > 1
    for index, page in enumerate(reader.pages, start=1):
        assert f"Page {index} of {total}" in page.extract_text()


# --- the Authority to Lodge -------------------------------------------------


def test_the_authority_to_lodge_builds_and_says_what_it_is_not(dealership):
    """A licensing-only dealer uses this alongside whatever contract they use
    themselves, and an instrument that read like a sale agreement would collide
    with it."""
    dealer, _profile = dealership
    dealer.plan = Dealer.Plan.LICENSING
    dealer.save(update_fields=["plan"])
    sale = priced_sale(dealer)

    text = extract_text(build_unsigned(sale, Kind.AUTHORITY_TO_LODGE).content)

    assert "authorised representative" in text
    assert "not a contract for the sale of the Vehicle" in text


def test_the_authority_names_a_licence_holder_who_is_not_the_purchaser(dealership):
    dealer, _profile = dealership
    dealer.plan = Dealer.Plan.LICENSING
    dealer.save(update_fields=["plan"])
    sale = priced_sale(
        dealer,
        purchaser_is_licence_holder=False,
        purchaser_family_name="Blake",
        purchaser_given_names="Jo",
        purchaser_address_line1="5 Other Street",
        purchaser_suburb="Perth",
        purchaser_postcode="6000",
    )

    text = extract_text(build_unsigned(sale, Kind.AUTHORITY_TO_LODGE).content)

    assert "Proposed Licence Holder" in text


def extract_text(pdf_bytes: str) -> str:
    """All of a PDF's text, with reportlab's line breaks flattened.

    The layout breaks a sentence across lines wherever the column happens to
    end, so asserting on a phrase means first undoing that. Whitespace is the
    only thing normalised — a test on contract wording that ignored punctuation
    would pass on a reworded clause.
    """
    import re

    reader = PdfReader(io.BytesIO(pdf_bytes))
    return re.sub(r"\s+", " ", " ".join(page.extract_text() for page in reader.pages))
