"""The backfill runs once, against live data, and cannot be rehearsed.

Its decisions are tested directly rather than by rewinding the database. The
columns it reads — ``stripe_checkout_session_id`` above all — are removed by
the migration immediately after it, so a test needing them present on a real
model would have to rewind two apps while rolling a third forward, which Django
refuses as a mixed plan. Passing stand-in rows instead tests the thing that can
actually be got wrong: which accounts get a record and which are left alone.

That the migration *runs* is covered by every test in the suite, since pytest
applies the full migration graph to build its database.

What this protects is the cutover window: a dealer who opened checkout before
the deploy and paid after it.
"""

from importlib import import_module
from types import SimpleNamespace

import pytest
from freetheplatform.payments import Payment


pytestmark = pytest.mark.django_db

migration = import_module("payments.migrations.0008_backfill_shared_payment_records")

DEALER_FLOW = "dealer.subscription"


def row(**overrides):
    """A stand-in for the historical Dealer or SeoSubscriber row."""
    fields = {
        "pk": 1,
        "stripe_customer_id": None,
        "stripe_subscription_id": None,
        "stripe_checkout_session_id": None,
        "payment_status": "payment_pending",
        "plan": "complete",
        "business_name": "Example Motorcycles",
        "subscription_current_period_end": None,
        "cancel_at_period_end": False,
    }
    fields.update(overrides)
    return SimpleNamespace(**fields)


def backfill_checkout(account, flow=DEALER_FLOW):
    migration._backfill_in_flight_checkout(
        Payment, account, flow, None, account.business_name, None
    )


# --------------------------------------------------------------------------
# Which accounts get a placeholder payment
# --------------------------------------------------------------------------

def test_a_checkout_open_at_the_cutover_gets_something_to_land_on():
    """The window this migration exists for.

    Without a payment row, a dealer who opened checkout before the deploy and
    paid after it hits a webhook that finds nothing — charged, not provisioned.
    """
    backfill_checkout(row(stripe_checkout_session_id="cs_inflight"))

    payment = Payment.objects.get(stripe_checkout_session_id="cs_inflight")
    assert payment.flow == DEALER_FLOW
    assert payment.purpose == "migrated"
    assert payment.related_label == "Example Motorcycles"
    # No quote, because none was ever recorded. The package treats that as
    # "nothing to compare" and adopts the amount Stripe reports rather than
    # refusing the payment for disagreeing with a zero it invented.
    assert payment.quote_sha256 == ""
    assert payment.total_amount == 0


@pytest.mark.parametrize("status", ["active", "paid"])
def test_an_already_paid_account_gets_no_placeholder(status):
    # A finished checkout needs no rescuing, and inventing a pending payment
    # for one would make a paid account look like it owed money.
    backfill_checkout(row(stripe_checkout_session_id="cs_done", payment_status=status))
    assert not Payment.objects.exists()


def test_an_account_with_no_open_checkout_is_left_alone():
    backfill_checkout(row())
    assert not Payment.objects.exists()


def test_running_it_twice_creates_one_payment():
    # A migration that half-applies and is re-run must not double up.
    account = row(stripe_checkout_session_id="cs_1")
    backfill_checkout(account)
    backfill_checkout(account)
    assert Payment.objects.count() == 1


def test_a_one_off_flow_is_recorded_as_a_payment_not_a_subscription():
    backfill_checkout(row(stripe_checkout_session_id="cs_oneoff"), flow="seo.oneoff")
    assert Payment.objects.get(stripe_checkout_session_id="cs_oneoff").mode == "payment"


# --------------------------------------------------------------------------
# Translating this site's access states back to Stripe's
# --------------------------------------------------------------------------

@pytest.mark.parametrize("local,stripe_status", [
    ("active", "active"),
    ("paid", "active"),
    ("past_due", "past_due"),
    ("cancelled", "canceled"),
    ("payment_pending", "incomplete"),
])
def test_payment_status_maps_onto_stripe_s_vocabulary(local, stripe_status):
    assert migration._STATUS_FROM_PAYMENT_STATUS[local] == stripe_status


def test_an_unknown_status_falls_back_to_incomplete():
    # Going from this site's smaller set back to Stripe's cannot be exact, so
    # the first real subscription event corrects whatever is guessed here.
    mapping = migration._STATUS_FROM_PAYMENT_STATUS
    assert mapping.get("something_new", "incomplete") == "incomplete"
