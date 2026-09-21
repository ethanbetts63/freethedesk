"""The reg 7 test, at every threshold from both sides.

It is a bright-line statutory test and the boundaries are the whole of it, so
each one is checked at the value that passes and at the value one step away that
does not. A test that only checks the middle of each range would pass on an
off-by-one that puts a customer on the wrong side of a warranty.
"""

from datetime import date

import pytest

from documents.models import FormTemplate
from documents.tests.factories import FormTemplateFactory
from documents.warranty import (
    WarrantyNoticeUnavailable,
    acknowledgement_key,
    notice_kind_for,
    notice_template,
    statutory_warranty_applies,
    warranty_notice,
)
from sales.models import Sale
from sales.tests.factories import SaleFactory

pytestmark = pytest.mark.django_db

#: Fixed, because "eight years old" is a moving answer and a suite that passes
#: in 2026 and fails in 2027 is worse than no suite.
TODAY = date(2026, 9, 19)

#: Comfortably inside every threshold, so a parametrised case moves exactly one
#: figure and nothing else explains the result.
PASSING = {
    "condition": Sale.Condition.USED,
    "vehicle_class": Sale.VehicleClass.MOTORCYCLE,
    "vehicle_price": 5000,
    "year": 2022,
    "odometer_km": 20_000,
}


def used(**overrides):
    return SaleFactory.build(**{**PASSING, **overrides})


def test_a_vehicle_inside_every_threshold_carries_the_statutory_warranty():
    assert statutory_warranty_applies(used(), today=TODAY) is True


@pytest.mark.parametrize(
    "field,passes,fails",
    [
        # Cash price including GST: at least $3,500.
        ("vehicle_price", 3500, 3499),
        # Age: eight years or less. 2026 - 2018 = 8; 2026 - 2017 = 9.
        ("year", 2018, 2017),
        # Odometer: 80,000km or less.
        ("odometer_km", 80_000, 80_001),
    ],
)
def test_each_threshold_holds_on_both_sides(field, passes, fails):
    assert statutory_warranty_applies(used(**{field: passes}), today=TODAY) is True
    assert statutory_warranty_applies(used(**{field: fails}), today=TODAY) is False


@pytest.mark.parametrize("field", ["vehicle_price", "year", "odometer_km"])
def test_a_missing_figure_fails_the_test_rather_than_passing_it(field):
    """Telling a customer a statutory warranty applies when it does not is a
    representation about their rights. Understating it is something they can
    check against the form they are given."""
    assert statutory_warranty_applies(used(**{field: None}), today=TODAY) is False


def test_a_moped_takes_the_motorcycle_thresholds():
    """Reg 7 draws its line between motor cycles and other vehicles, and a moped
    is on the motor cycle side of it."""
    sale = used(vehicle_class=Sale.VehicleClass.MOPED, vehicle_price=3500)

    assert statutory_warranty_applies(sale, today=TODAY) is True


def test_passing_the_test_selects_form_5a_and_failing_it_selects_form_6():
    assert notice_kind_for(used(), today=TODAY) == FormTemplate.Kind.FORM_5A_MOTORCYCLE
    assert notice_kind_for(used(vehicle_price=1000), today=TODAY) == FormTemplate.Kind.FORM_6


def test_new_stock_gets_neither_prescribed_form():
    """The manufacturer's warranty information is product copy, not a
    prescribed form."""
    sale = used(condition=Sale.Condition.NEW, odometer_km=None)

    assert notice_kind_for(sale, today=TODAY) is None
    assert warranty_notice(sale, today=TODAY)["kind"] == "manufacturer"


def test_a_demonstrator_is_used_stock():
    assert notice_kind_for(used(condition=Sale.Condition.DEMO), today=TODAY) is not None


# --- the fingerprint --------------------------------------------------------


@pytest.mark.parametrize(
    "field,value",
    [
        ("vehicle_price", 4000),
        ("year", 2019),
        ("odometer_km", 30_000),
        ("condition", Sale.Condition.NEW),
    ],
)
def test_moving_an_input_changes_the_fingerprint(field, value):
    """This is what makes an acknowledgement stop counting when its inputs move,
    with no flag anyone has to remember to clear."""
    before = acknowledgement_key(used(), today=TODAY)

    assert acknowledgement_key(used(**{field: value}), today=TODAY) != before


def test_moving_something_the_notice_does_not_depend_on_leaves_it_alone():
    """Otherwise every correction to a phone number would send the customer back
    to re-read a notice that says exactly what it said before."""
    before = acknowledgement_key(used(), today=TODAY)

    assert acknowledgement_key(used(customer_phone="0400 000 111"), today=TODAY) == before


def test_an_acknowledgement_counts_only_against_the_notice_it_was_made_for():
    sale = used()
    sale.warranty_acknowledgement_key = acknowledgement_key(sale, today=TODAY)

    assert warranty_notice(sale, today=TODAY)["acknowledged"] is True

    sale.vehicle_price = 9000
    assert warranty_notice(sale, today=TODAY)["acknowledged"] is False


def test_an_unacknowledged_sale_is_not_reported_as_acknowledged():
    assert warranty_notice(used(), today=TODAY)["acknowledged"] is False


# --- the form itself --------------------------------------------------------


def test_the_notice_serves_the_published_form_in_force():
    FormTemplateFactory(
        kind=FormTemplate.Kind.FORM_5A_MOTORCYCLE, version_label="2026-08-21"
    )
    sale = SaleFactory(**PASSING)

    template = notice_template(sale, today=TODAY)

    assert template.kind == FormTemplate.Kind.FORM_5A_MOTORCYCLE
    assert template.is_current is True


def test_the_notice_refuses_rather_than_substituting_when_no_form_is_loaded():
    """Reg 7 requires the purchaser be given a statement *in the form of* Form 5A
    or Form 6, so the form is the statement and there is nothing to substitute.
    A quiet omission would leave the dealer not having complied without knowing
    it."""
    sale = SaleFactory(**PASSING)

    with pytest.raises(WarrantyNoticeUnavailable):
        notice_template(sale, today=TODAY)
