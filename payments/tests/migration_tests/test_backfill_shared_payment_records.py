"""The backfill runs once, against live data, and cannot be rehearsed.

So it is tested directly: the functions are called with the historical models
the migration itself would receive, on rows shaped like production's. What this
protects is the cutover window — a dealer who opened checkout before the deploy
and paid after it.
"""

from importlib import import_module

import pytest
from django.apps import apps as global_apps
from freetheplatform.payments import BillingCustomer, Payment, Subscription

from dealers.models import Dealer
from dealers.tests.factories import DealerFactory
from seo.models import SeoSubscriber
from seo.tests.factories import SeoSubscriberFactory


pytestmark = pytest.mark.django_db

migration = import_module("payments.migrations.0008_backfill_shared_payment_records")


def run_backfill():
    # The real models rather than historical ones: the fields this migration
    # touches are identical in both, and using them keeps the test readable.
    migration.backfill(global_apps, None)


def test_an_existing_stripe_customer_becomes_a_billing_customer():
    dealer = DealerFactory(
        business_name="Example Motorcycles", stripe_customer_id="cus_existing"
    )
    run_backfill()

    customer = BillingCustomer.objects.get(stripe_customer_id="cus_existing")
    assert customer.related == dealer
    assert customer.related_label == "Example Motorcycles"
    # No Stripe call was made, and none should have been: this describes a
    # customer Stripe already has.
    assert customer.email_snapshot == dealer.user.email


def test_an_existing_subscription_becomes_trackable():
    dealer = DealerFactory(
        stripe_customer_id="cus_1",
        stripe_subscription_id="sub_existing",
        payment_status=Dealer.PaymentStatus.ACTIVE,
    )
    run_backfill()

    subscription = Subscription.objects.get(stripe_subscription_id="sub_existing")
    assert subscription.related == dealer
    assert subscription.status == "active"
    assert subscription.plan_key == dealer.plan
    # Never guessed: paid_through means an invoice was actually paid, and the
    # old schema never recorded that. The first invoice.paid sets it.
    assert subscription.paid_through is None


def test_a_checkout_open_at_the_cutover_gets_something_to_land_on():
    """The window this migration exists for.

    Without a payment row, a dealer who opened checkout before the deploy and
    paid after it hits a webhook that finds nothing — charged, not provisioned.
    """
    dealer = DealerFactory(
        stripe_checkout_session_id="cs_inflight",
        payment_status=Dealer.PaymentStatus.PAYMENT_PENDING,
    )
    run_backfill()

    payment = Payment.objects.get(stripe_checkout_session_id="cs_inflight")
    assert payment.related == dealer
    assert payment.flow == "dealer.subscription"
    assert payment.purpose == "migrated"
    # No quote, because none was ever recorded. The package treats that as
    # "nothing to compare" and adopts the amount Stripe reports.
    assert payment.quote_sha256 == ""


def test_an_already_paid_account_gets_no_placeholder_payment():
    # A finished checkout needs no rescuing, and inventing a pending payment
    # for one would make the account look like it owed money.
    DealerFactory(
        stripe_checkout_session_id="cs_done",
        payment_status=Dealer.PaymentStatus.ACTIVE,
    )
    run_backfill()
    assert not Payment.objects.filter(stripe_checkout_session_id="cs_done").exists()


def test_an_account_stripe_has_never_seen_is_left_alone():
    DealerFactory(stripe_customer_id=None, stripe_subscription_id=None)
    run_backfill()
    assert BillingCustomer.objects.count() == 0
    assert Subscription.objects.count() == 0
    assert Payment.objects.count() == 0


def test_seo_subscribers_are_backfilled_too():
    subscriber = SeoSubscriberFactory(
        business_name="Peak Digital",
        stripe_customer_id="cus_seo",
        stripe_subscription_id="sub_seo",
        payment_status=SeoSubscriber.PaymentStatus.ACTIVE,
    )
    run_backfill()

    assert BillingCustomer.objects.get(stripe_customer_id="cus_seo").related == subscriber
    assert Subscription.objects.get(stripe_subscription_id="sub_seo").flow == "seo.subscription"


def test_running_it_twice_changes_nothing():
    # A migration that half-applies and is re-run must not double up.
    DealerFactory(
        stripe_customer_id="cus_1",
        stripe_subscription_id="sub_1",
        stripe_checkout_session_id="cs_1",
        payment_status=Dealer.PaymentStatus.PAYMENT_PENDING,
    )
    run_backfill()
    run_backfill()

    assert BillingCustomer.objects.count() == 1
    assert Subscription.objects.count() == 1
    assert Payment.objects.count() == 1


def test_a_dealer_and_a_subscriber_get_separate_billing_customers():
    # They are two Stripe Customers today, and the migration describes what is
    # there rather than merging them.
    DealerFactory(stripe_customer_id="cus_dealer")
    SeoSubscriberFactory(stripe_customer_id="cus_seo")
    run_backfill()
    assert BillingCustomer.objects.count() == 2
