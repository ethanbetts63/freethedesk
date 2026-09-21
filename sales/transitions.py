"""The sale state machine.

Its own module rather than conditionals spread across views, because two things
in this flow are genuinely stateful and both are easy to get quietly wrong:

- **The offer window.** A customer's signature is an offer under Schedule 5
  cl 1.1; a contract exists only once the dealer signs *and* gives notice
  (cl 1.2). Three separate recorded moments, not one.
- **The payment gate.** Money moves customer-to-dealer by BSB and FreeTheDesk
  never sees it, so the customer claiming payment and the dealer confirming
  receipt are distinct acts by distinct actors.

Lapse is deliberately **not** here. The offer lapses at close of business the
next business day, and the product surfaces that without enforcing it: the
dealer is shown the deadline and decides. Nothing in this module reaches a
lapsed state by the clock, and the test suite asserts the absence of that
transition so it is not helpfully added later.

See `_docs/licensing/plan/02-sale-flow.md`.
"""

from django.db import transaction
from django.utils import timezone

from sales.models import Sale, SaleEvent


class InvalidTransition(Exception):
    """The sale cannot move from where it is to where it was asked to go."""


Status = Sale.Status

#: Where each state may go next. A state absent from a set is not merely
#: discouraged, it is refused.
ALLOWED = {
    Status.DRAFT: {Status.AWAITING_CUSTOMER, Status.CANCELLED},
    # Identity review is entered only where a provider needs a human. It
    # disappears when Stripe Identity replaces the manual step, which is why it
    # is a state rather than a flag on the one before it.
    Status.AWAITING_CUSTOMER: {
        Status.AWAITING_IDENTITY_REVIEW,
        Status.READY_TO_SIGN,
        Status.CANCELLED,
    },
    # Back to the customer on rejection, with the dealer's reason.
    Status.AWAITING_IDENTITY_REVIEW: {
        Status.AWAITING_CUSTOMER,
        Status.READY_TO_SIGN,
        Status.CANCELLED,
    },
    # Back to the customer when an edit invalidates the warranty
    # acknowledgement or the details behind a document.
    Status.READY_TO_SIGN: {Status.AWAITING_CUSTOMER, Status.SIGNED, Status.CANCELLED},
    Status.SIGNED: {Status.ACCEPTED, Status.CANCELLED},
    Status.ACCEPTED: {Status.AWAITING_PAYMENT, Status.CANCELLED},
    Status.AWAITING_PAYMENT: {Status.PAYMENT_CONFIRMED, Status.CANCELLED},
    Status.PAYMENT_CONFIRMED: {Status.COMPLETED, Status.CANCELLED},
    Status.COMPLETED: set(),
    Status.CANCELLED: set(),
}

#: Entering one of these states stamps its timestamp. Re-entering overwrites,
#: which is correct where it can happen: a sale signed again after an edit has a
#: new offer, and therefore a new clock.
STAMPS = {
    Status.SIGNED: "signed_at",
    Status.ACCEPTED: "accepted_at",
    Status.PAYMENT_CONFIRMED: "payment_confirmed_at",
    Status.COMPLETED: "completed_at",
    Status.CANCELLED: "cancelled_at",
}


def can_transition(sale, to_status) -> bool:
    return to_status in ALLOWED.get(sale.status, set())


@transaction.atomic
def transition(sale, to_status, *, actor=None, actor_label="", ip_address=None,
               user_agent="", **context):
    """Move a sale, stamp the moment, and record who did it.

    One transaction, so a sale never advances without the event that explains
    why. The event is the point of the exercise — a status column alone says
    where a sale is and nothing about how it got there.
    """
    if to_status not in Status.values:
        raise InvalidTransition(f"{to_status!r} is not a sale status.")
    if not can_transition(sale, to_status):
        raise InvalidTransition(
            f"{sale.reference} is {sale.status} and cannot move to {to_status}."
        )

    now = timezone.now()
    changed = ["status", "updated_at"]
    from_status = sale.status
    sale.status = to_status

    stamp = STAMPS.get(to_status)
    if stamp:
        setattr(sale, stamp, now)
        changed.append(stamp)

    sale.save(update_fields=changed)

    SaleEvent.all_objects.create(
        dealer_id=sale.dealer_id,
        sale=sale,
        kind=f"status.{to_status}",
        actor=actor,
        actor_label=actor_label,
        ip_address=ip_address,
        user_agent=(user_agent or "")[:500],
        context={"from": from_status, "to": to_status, **context},
    )
    return sale


def record(sale, kind, *, actor=None, actor_label="", ip_address=None, user_agent="",
           **context):
    """Write an event that is not a state change.

    The customer claiming they have paid, a document being signed, an identity
    image being rejected: all are things that happened to a sale and belong in
    its history, and none of them moves it on its own.
    """
    return SaleEvent.all_objects.create(
        dealer_id=sale.dealer_id,
        sale=sale,
        kind=kind,
        actor=actor,
        actor_label=actor_label,
        ip_address=ip_address,
        user_agent=(user_agent or "")[:500],
        context=context,
    )
