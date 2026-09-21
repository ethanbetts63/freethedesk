"""The tenant manager, and the cost it deliberately accepts.

These assert the *shape* of the guard rail rather than anything about a request.
What stops one dealer reading another's sale over HTTP is the view's scoping and
the cross-tenant test on that endpoint; this file only proves that skipping the
scoping raises instead of returning rows.
"""

import pytest

from core.models import TenantScopeRequired
from dealers.tests.factories import DealerFactory
from sales.models import Sale, SaleEvent
from sales.tests.factories import SaleFactory

pytestmark = pytest.mark.django_db


def test_an_unscoped_query_raises_rather_than_returning_rows():
    SaleFactory()

    with pytest.raises(TenantScopeRequired):
        list(Sale.objects.all())


def test_every_queryset_entry_point_is_covered_not_just_all():
    """`.filter()` and `.get()` route through `get_queryset` too.

    Worth asserting explicitly: a manager that only overrode `.all()` would look
    safe and leak through the two methods people actually type.
    """
    SaleFactory()

    with pytest.raises(TenantScopeRequired):
        Sale.objects.filter(status=Sale.Status.DRAFT).exists()
    with pytest.raises(TenantScopeRequired):
        Sale.objects.get(status=Sale.Status.DRAFT)
    with pytest.raises(TenantScopeRequired):
        Sale.objects.count()


def test_for_dealer_returns_only_that_dealers_sales():
    mine = SaleFactory()
    theirs = SaleFactory()

    visible = list(Sale.objects.for_dealer(mine.dealer))

    assert visible == [mine]
    assert theirs not in visible


def test_for_dealer_of_a_dealer_with_nothing_is_empty_not_everything():
    SaleFactory()
    bystander = DealerFactory()

    assert list(Sale.objects.for_dealer(bystander)) == []


def test_all_objects_is_the_escape_hatch():
    """Staff, management commands and migrations need a way through.

    Named rather than implicit so that reaching for it is visible in review.
    """
    SaleFactory()
    SaleFactory()

    assert Sale.all_objects.count() == 2


def test_a_forward_relation_still_works():
    """`base_manager_name` is not optional.

    Django traverses a forward foreign key through the *base* manager. Left
    pointing at the strict one, reading `sale.dealer` would raise — and it would
    raise deep inside unrelated code rather than at a query somebody wrote.
    """
    sale = SaleFactory()
    reloaded = Sale.all_objects.get(pk=sale.pk)

    assert reloaded.dealer == sale.dealer
    reloaded.refresh_from_db()


def test_the_reverse_accessor_raises_which_is_the_accepted_cost():
    """Documented, not a bug.

    Django builds reverse managers from the related model's default manager, so
    a tenant model's reverse accessor inherits the refusal. The trade is one
    idiom everywhere — `for_dealer` — and this test exists so the day somebody
    hits it, they find the decision rather than a puzzle.
    """
    sale = SaleFactory()

    with pytest.raises(TenantScopeRequired):
        list(sale.dealer.sales_sale_set.all())


def test_sale_events_are_scoped_to_one_sale():
    sale = SaleFactory()
    other = SaleFactory()
    SaleEvent.all_objects.create(dealer=sale.dealer, sale=sale, kind="test.one")
    SaleEvent.all_objects.create(dealer=other.dealer, sale=other, kind="test.two")

    events = list(SaleEvent.objects.for_sale(sale))

    assert [event.kind for event in events] == ["test.one"]


def test_sale_events_also_refuse_an_unscoped_query():
    sale = SaleFactory()
    SaleEvent.all_objects.create(dealer=sale.dealer, sale=sale, kind="test.one")

    with pytest.raises(TenantScopeRequired):
        list(SaleEvent.objects.all())
