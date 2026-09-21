import pytest

from core.tests.factories import UserFactory
from sales.models import Sale, SaleEvent
from sales.tests.factories import SaleFactory
from sales.transitions import ALLOWED, InvalidTransition, can_transition, record, transition

pytestmark = pytest.mark.django_db

Status = Sale.Status

THE_HAPPY_PATH = [
    Status.AWAITING_CUSTOMER,
    Status.AWAITING_IDENTITY_REVIEW,
    Status.READY_TO_SIGN,
    Status.SIGNED,
    Status.ACCEPTED,
    Status.AWAITING_PAYMENT,
    Status.PAYMENT_CONFIRMED,
    Status.COMPLETED,
]


def test_a_sale_walks_the_whole_flow():
    sale = SaleFactory()

    for step in THE_HAPPY_PATH:
        transition(sale, step)

    assert sale.status == Status.COMPLETED
    sale.refresh_from_db()
    assert sale.status == Status.COMPLETED


@pytest.mark.parametrize("target", [Status.SIGNED, Status.ACCEPTED, Status.COMPLETED])
def test_a_draft_cannot_jump_straight_to_a_later_state(target):
    sale = SaleFactory()

    with pytest.raises(InvalidTransition):
        transition(sale, target)

    sale.refresh_from_db()
    assert sale.status == Status.DRAFT


def test_a_refused_transition_writes_no_event():
    """A rejection must leave no trace, or the audit trail records attempts as
    though they were changes."""
    sale = SaleFactory()

    with pytest.raises(InvalidTransition):
        transition(sale, Status.COMPLETED)

    assert not SaleEvent.objects.for_sale(sale).exists()


def test_an_unknown_status_is_refused():
    sale = SaleFactory()

    with pytest.raises(InvalidTransition):
        transition(sale, "nearly_done")


@pytest.mark.parametrize("terminal", [Status.COMPLETED, Status.CANCELLED])
def test_a_terminal_sale_goes_nowhere(terminal):
    sale = SaleFactory(status=terminal)

    for target in Status.values:
        assert not can_transition(sale, target)


def test_a_sale_can_be_cancelled_from_anywhere_before_completion():
    for start in Status.values:
        if start in (Status.COMPLETED, Status.CANCELLED):
            continue
        assert Status.CANCELLED in ALLOWED[start], start


def test_identity_rejection_sends_the_customer_back():
    sale = SaleFactory(status=Status.AWAITING_IDENTITY_REVIEW)

    transition(sale, Status.AWAITING_CUSTOMER)

    assert sale.status == Status.AWAITING_CUSTOMER


def test_an_edit_can_send_a_signable_sale_back_to_the_customer():
    """Changing a detail invalidates the warranty acknowledgement and any signed
    document, so the sale has to be able to go backwards."""
    sale = SaleFactory(status=Status.READY_TO_SIGN)

    transition(sale, Status.AWAITING_CUSTOMER)

    assert sale.status == Status.AWAITING_CUSTOMER


def test_signing_stamps_the_moment_the_offer_was_made():
    sale = SaleFactory(status=Status.READY_TO_SIGN)

    transition(sale, Status.SIGNED)

    sale.refresh_from_db()
    assert sale.signed_at is not None


def test_acceptance_and_its_notice_are_recorded_separately():
    """Schedule 5 cl 1.2 is two acts. The transition records the signature; the
    notice is stamped by whatever actually sends it, so a send that fails cannot
    be mistaken for a notice that was given."""
    sale = SaleFactory(status=Status.SIGNED)

    transition(sale, Status.ACCEPTED)

    sale.refresh_from_db()
    assert sale.accepted_at is not None
    assert sale.acceptance_notified_at is None


def test_nothing_transitions_a_sale_to_a_lapsed_state():
    """The offer lapses at close of business the next business day, and the
    product surfaces that without enforcing it — the dealer decides.

    This asserts an absence on purpose. A future reader who thinks the clock
    should void a sale will fail here and find the decision in
    `02-sale-flow.md` rather than quietly adding one.
    """
    assert not any(status.endswith("lapsed") for status in Status.values)


def test_every_transition_records_who_did_it_and_from_where():
    sale = SaleFactory()
    user = UserFactory(username="sam@dealer.example")

    transition(
        sale,
        Status.AWAITING_CUSTOMER,
        actor=user,
        actor_label="Sam Lee",
        ip_address="203.0.113.7",
        user_agent="Mozilla/5.0",
    )

    event = SaleEvent.objects.for_sale(sale).get()
    assert event.kind == "status.awaiting_customer"
    assert event.actor == user
    assert event.actor_label == "Sam Lee"
    assert event.ip_address == "203.0.113.7"
    assert event.context == {"from": Status.DRAFT, "to": Status.AWAITING_CUSTOMER}


def test_an_event_carries_the_dealer_so_it_is_tenant_scoped_too():
    sale = SaleFactory()

    transition(sale, Status.AWAITING_CUSTOMER)

    assert SaleEvent.objects.for_dealer(sale.dealer).count() == 1


def test_a_customer_action_is_recorded_without_an_actor():
    """The customer holds a capability, not an identity, so there is no user row
    to point at and the label is the only honest answer."""
    sale = SaleFactory(status=Status.AWAITING_PAYMENT)

    record(sale, "payment.customer_marked_paid", actor_label="Alex Tran (customer)")

    event = SaleEvent.objects.for_sale(sale).get()
    assert event.actor is None
    assert event.actor_label == "Alex Tran (customer)"
    assert sale.status == Status.AWAITING_PAYMENT


def test_an_overlong_user_agent_is_truncated_rather_than_raising():
    sale = SaleFactory()

    transition(sale, Status.AWAITING_CUSTOMER, user_agent="x" * 900)

    assert len(SaleEvent.objects.for_sale(sale).get().user_agent) == 500
