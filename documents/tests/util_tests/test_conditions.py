"""Which Special Conditions print on which sale.

Each condition is checked for appearing exactly when it should and not
otherwise. A condition printed on the wrong contract is not a cosmetic problem:
SC5 moves when the balance falls due, and SC1 changes where the dealer is
obliged to deliver.
"""

import pytest

from dealers.tests.factories import DealerFactory, DealerProfileFactory
from dealers.utils import special_conditions
from documents.conditions import conditions_for
from sales.models import Sale
from sales.tests.factories import SaleFactory

pytestmark = pytest.mark.django_db


@pytest.fixture
def dealership():
    dealer = DealerFactory()
    dealer.user.email = "sales@bikeswa.example"
    dealer.user.save(update_fields=["email"])
    return dealer, DealerProfileFactory(dealer=dealer)


def numbers(sale, dealership):
    dealer, profile = dealership
    return [number for number, _heading, _paragraphs in conditions_for(sale, dealer, profile)]


def test_every_sale_gets_the_two_that_cannot_be_removed(dealership):
    dealer, _profile = dealership
    printed = numbers(SaleFactory(dealer=dealer), dealership)

    assert "SC2" in printed
    assert "SC6" in printed


def test_delivery_conditions_print_only_on_a_delivery(dealership):
    dealer, _profile = dealership
    delivered = SaleFactory(dealer=dealer, fulfilment_method=Sale.Fulfilment.DELIVERY)
    collected = SaleFactory(dealer=dealer, fulfilment_method=Sale.Fulfilment.PICKUP)

    assert {"SC1", "SC7", "SC9"} <= set(numbers(delivered, dealership))
    assert {"SC1", "SC7", "SC9"}.isdisjoint(numbers(collected, dealership))


def test_new_stock_conditions_print_only_on_new_stock(dealership):
    dealer, _profile = dealership
    new = SaleFactory(dealer=dealer, condition=Sale.Condition.NEW, odometer_km=None)
    used = SaleFactory(dealer=dealer, condition=Sale.Condition.USED)

    assert {"SC3", "SC4"} <= set(numbers(new, dealership))
    assert {"SC3", "SC4"}.isdisjoint(numbers(used, dealership))


def test_sc5_does_not_print_on_used_stock(dealership):
    """This corrects allbikes, which prints it on every contract.

    SC5 moves the balance from delivery to licensing, and its justification is a
    first-licensing problem: the Department will only accept proof of ownership
    showing paid in full, and the vehicle must be licensed before delivery. A
    used vehicle is already licensed, MR9B is lodged within seven days of sale,
    and nothing requires transfer before delivery — so on the used path
    prescribed cl 3.1 works unmodified and varying it would be a term with no
    basis.
    """
    dealer, _profile = dealership
    used = SaleFactory(dealer=dealer, condition=Sale.Condition.USED)
    demo = SaleFactory(dealer=dealer, condition=Sale.Condition.DEMO)
    new = SaleFactory(dealer=dealer, condition=Sale.Condition.NEW, odometer_km=None)

    assert "SC5" not in numbers(used, dealership)
    assert "SC5" not in numbers(demo, dealership)
    assert "SC5" in numbers(new, dealership)


def test_there_is_no_sc8_on_any_contract(dealership):
    dealer, _profile = dealership
    for condition in (Sale.Condition.NEW, Sale.Condition.USED):
        sale = SaleFactory(
            dealer=dealer,
            condition=condition,
            odometer_km=None if condition == Sale.Condition.NEW else 12000,
        )
        assert "SC8" not in numbers(sale, dealership)


def test_a_condition_the_dealer_removed_does_not_print(dealership):
    dealer, profile = dealership
    profile.condition_choices = {
        "defaults": {"SC9": False},
        "additions": [],
    }
    profile.save(update_fields=["condition_choices"])
    sale = SaleFactory(dealer=dealer, fulfilment_method=Sale.Fulfilment.DELIVERY)

    printed = numbers(sale, dealership)

    assert "SC9" not in printed
    assert "SC1" in printed


def test_sc2_forks_on_who_the_vehicle_is_being_licensed_to(dealership):
    dealer, profile = dealership
    own = SaleFactory(dealer=dealer, purchaser_is_licence_holder=True)
    other = SaleFactory(
        dealer=dealer,
        purchaser_is_licence_holder=False,
        licence_given_names="Robin",
        licence_family_name="Tran",
    )

    def sc2(sale):
        return next(
            (heading, paragraphs)
            for number, heading, paragraphs in conditions_for(sale, dealer, profile)
            if number == "SC2"
        )

    heading, paragraphs = sc2(own)
    assert heading == "Authority to licence the Vehicle"
    assert "Proposed Licence Holder" not in " ".join(paragraphs)

    heading, paragraphs = sc2(other)
    assert heading == "Licensing of the Vehicle in another person’s name"
    body = " ".join(paragraphs)
    assert "Robin Tran (the Proposed Licence Holder)" in body
    # The fork has to say this, or a person who is not buying the vehicle reads
    # a contract that appears to bind them.
    assert "does not" in body or "Nothing in this Special Condition makes" in body


def test_the_per_sale_values_are_filled_in(dealership):
    dealer, profile = dealership
    sale = SaleFactory(
        dealer=dealer,
        fulfilment_method=Sale.Fulfilment.DELIVERY,
        delivery_address_line1="12 Example Street",
        delivery_suburb="Fremantle",
        delivery_state="WA",
        delivery_postcode="6160",
        customer_email="alex@example.com",
    )

    printed = dict(
        (number, " ".join(paragraphs))
        for number, _heading, paragraphs in conditions_for(sale, dealer, profile)
    )

    assert "12 Example Street, Fremantle, WA, 6160" in printed["SC1"]
    assert "alex@example.com" in printed["SC6"]
    assert "sales@bikeswa.example" in printed["SC6"]
    # A brace left in a contract is a clause nobody proofread.
    assert "{" not in " ".join(printed.values())


def test_the_dealers_own_conditions_print_after_the_defaults(dealership):
    dealer, profile = dealership
    profile.condition_choices = {
        "defaults": {number: True for number in special_conditions.BY_NUMBER},
        "additions": [
            {"heading": "Card deposits", "paragraphs": ["Processing fees are not refundable."]},
            {"heading": "Storage", "paragraphs": ["Storage is charged after 14 days."]},
        ],
    }
    profile.save(update_fields=["condition_choices"])
    sale = SaleFactory(dealer=dealer)

    printed = conditions_for(sale, dealer, profile)

    assert [number for number, _h, _p in printed][-2:] == ["SC11", "SC12"]
    assert printed[-1][1] == "Storage"


def test_an_addition_is_never_filtered_by_the_sale(dealership):
    """It was written for this dealer's business by this dealer, and nothing
    here knows enough to decide when one of them applies."""
    dealer, profile = dealership
    profile.condition_choices = {
        "defaults": {},
        "additions": [{"heading": "Anything", "paragraphs": ["Applies always."]}],
    }
    profile.save(update_fields=["condition_choices"])

    for method in (Sale.Fulfilment.DELIVERY, Sale.Fulfilment.PICKUP):
        sale = SaleFactory(dealer=dealer, fulfilment_method=method)
        assert "SC11" in numbers(sale, dealership)
