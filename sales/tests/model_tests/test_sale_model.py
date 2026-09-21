import pytest
from django.db import IntegrityError

from sales.models import Sale, generate_reference
from sales.tests.factories import SaleFactory

pytestmark = pytest.mark.django_db


def test_a_reference_is_assigned_on_first_save():
    sale = SaleFactory()

    assert sale.reference.startswith("S-")
    assert len(sale.reference) == len("S-") + 10


def test_a_reference_is_not_reassigned_on_a_later_save():
    sale = SaleFactory()
    original = sale.reference

    sale.customer_name = "Someone Else"
    sale.save()
    sale.refresh_from_db()

    assert sale.reference == original


def test_references_are_unique_across_dealers():
    """The column is the guarantee; the generator's retry only avoids the 500.

    Uniqueness is table-wide rather than per dealer, because a reference is what
    a customer types to get back into their own sale.
    """
    first = SaleFactory()
    clash = SaleFactory.build(dealer=first.dealer, reference=first.reference)

    with pytest.raises(IntegrityError):
        clash.save()


def test_the_generator_skips_a_reference_already_taken(monkeypatch):
    taken = SaleFactory()
    minted = iter([taken.reference[2:].lower(), "abcdef0123"])
    monkeypatch.setattr("sales.models.sale.secrets.token_hex", lambda _n: next(minted))

    assert generate_reference() == "S-ABCDEF0123"


def test_each_sale_gets_its_own_access_token():
    assert SaleFactory().access_token != SaleFactory().access_token


def test_a_sale_starts_as_a_draft():
    assert SaleFactory().status == Sale.Status.DRAFT


@pytest.mark.parametrize(
    "condition,used",
    [(Sale.Condition.NEW, False), (Sale.Condition.USED, True), (Sale.Condition.DEMO, True)],
)
def test_demo_stock_counts_as_used(condition, used):
    """Demo stock is already licensed, so it takes the used path.

    Stated as a test because it decides which prescribed form is produced and
    which special conditions print, and the answer is not obvious from the name.
    """
    assert SaleFactory.build(condition=condition).is_used_stock is used


@pytest.mark.parametrize(
    "produces,licensing,contract",
    [
        (Sale.Produces.LICENSING, True, False),
        (Sale.Produces.CONTRACTS, False, True),
        (Sale.Produces.COMPLETE, True, True),
    ],
)
def test_the_plan_snapshot_decides_the_document_set(produces, licensing, contract):
    sale = SaleFactory.build(produces=produces)

    assert sale.produces_licensing is licensing
    assert sale.produces_contract is contract


def test_negative_money_is_refused_by_the_database():
    sale = SaleFactory()
    sale.vehicle_price = -1

    with pytest.raises(IntegrityError):
        sale.save()
