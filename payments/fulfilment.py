"""What each kind of payment means once the money has actually arrived.

``freetheplatform.payments`` owns the Stripe conversation, the ``Payment`` row
and the guarantee that one event is applied once. What being paid *entitles
somebody to* — a dealer listed, an SEO profile provisioned, a package order
marked paid, and how long a subscription survives a failed renewal — is this
site's business and lives here.

**Two rules, both from the package's contract.** A callback runs inside the
webhook's transaction, so:

1. It writes rows and nothing else. Anything outward goes through
   ``transaction.on_commit``, which is what stops somebody being told about a
   subscription whose transaction then rolled back.
2. It is idempotent. Stripe delivers an event more than once, and while the
   package makes a *duplicate* delivery a no-op, a genuinely new event about
   a dealer already provisioned must still land harmlessly.
"""

import logging

from django.db import transaction
from django.utils import timezone
from freetheplatform.payments import register_handler

from core.models import PackageOrder
from core.utils.notifications import notify_of_paid_package_order
from dealers.models import Dealer
from dealers.utils.services import ensure_dealer_profile
from seo.models import SeoSubscriber
from seo.utils.services import activate_paid_subscriber, ensure_seo_profile

from .flows import DEALER_SUBSCRIPTION, PACKAGE_ORDER, SEO_ONEOFF, SEO_SUBSCRIPTION


logger = logging.getLogger(__name__)


# Stripe's vocabulary is richer than this site's access policy, and collapsing
# it is a site decision — which is why the package stores Stripe's own values
# and this table lives here rather than there.
_DEALER_STATUS = {
    "active": Dealer.PaymentStatus.ACTIVE,
    "trialing": Dealer.PaymentStatus.ACTIVE,
    "past_due": Dealer.PaymentStatus.PAST_DUE,
    "unpaid": Dealer.PaymentStatus.PAST_DUE,
    "canceled": Dealer.PaymentStatus.CANCELLED,
    "paused": Dealer.PaymentStatus.CANCELLED,
}

_SEO_STATUS = {
    "active": SeoSubscriber.PaymentStatus.ACTIVE,
    "trialing": SeoSubscriber.PaymentStatus.ACTIVE,
    "past_due": SeoSubscriber.PaymentStatus.PAST_DUE,
    "unpaid": SeoSubscriber.PaymentStatus.PAST_DUE,
    "canceled": SeoSubscriber.PaymentStatus.CANCELLED,
    "paused": SeoSubscriber.PaymentStatus.CANCELLED,
}


def _locked(model, related):
    """Re-read the related row under a lock inside the webhook transaction."""
    if related is None:
        return None
    return model.objects.select_for_update().filter(pk=related.pk).first()


# --------------------------------------------------------------------------
# Dealer subscription
# --------------------------------------------------------------------------

def dealer_payment_succeeded(*, payment, related):
    dealer = _locked(Dealer, related)
    if dealer is None:
        # Deleting a dealer with a live subscription is a data problem, not a
        # payment one. Raising would poison the event for three days of
        # retries and fix nothing.
        logger.error("Payment %s succeeded for a dealer that no longer exists.", payment.pk)
        return

    dealer.stripe_subscription_id = (
        payment.stripe_subscription_id or dealer.stripe_subscription_id
    )
    dealer.payment_status = Dealer.PaymentStatus.ACTIVE
    dealer.save(update_fields=["stripe_subscription_id", "payment_status", "updated_at"])
    ensure_dealer_profile(dealer)


def dealer_payment_failed(*, payment, related):
    dealer = _locked(Dealer, related)
    if dealer is None:
        return
    # Only a first payment moves the dealer backwards. A failed renewal is a
    # subscription event, and access through one is decided below.
    if dealer.payment_status == Dealer.PaymentStatus.PAYMENT_PENDING:
        dealer.save(update_fields=["updated_at"])


def dealer_subscription_changed(*, subscription, related):
    dealer = _locked(Dealer, related)
    if dealer is None:
        return
    dealer.stripe_subscription_id = subscription.stripe_subscription_id
    dealer.payment_status = _DEALER_STATUS.get(
        subscription.status, Dealer.PaymentStatus.PAYMENT_PENDING
    )
    dealer.subscription_current_period_end = subscription.current_period_end
    dealer.cancel_at_period_end = subscription.cancel_at_period_end
    dealer.save(update_fields=[
        "stripe_subscription_id", "payment_status",
        "subscription_current_period_end", "cancel_at_period_end", "updated_at",
    ])
    if dealer.payment_status == Dealer.PaymentStatus.ACTIVE:
        ensure_dealer_profile(dealer)


def dealer_renewal_paid(*, subscription, payment, related):
    dealer = _locked(Dealer, related)
    if dealer is None:
        return
    # A renewal that was actually paid, which is a different claim from the
    # subscription being 'active' — Stripe advances the period when it issues
    # an invoice, not when somebody pays one.
    dealer.payment_status = Dealer.PaymentStatus.ACTIVE
    dealer.subscription_current_period_end = (
        subscription.paid_through or dealer.subscription_current_period_end
    )
    dealer.save(update_fields=[
        "payment_status", "subscription_current_period_end", "updated_at",
    ])
    ensure_dealer_profile(dealer)


def dealer_refunded(*, payment, related):
    dealer = _locked(Dealer, related)
    if dealer is None:
        return
    # Recorded, not acted on. Whether a refund ends a dealer's access is a
    # commercial decision somebody makes deliberately, usually alongside the
    # refund itself, so this leaves the account alone and says so loudly.
    logger.warning(
        "Dealer %s was refunded %s on payment %s; access is unchanged.",
        dealer.pk, payment.refunded_amount, payment.pk,
    )


# --------------------------------------------------------------------------
# SEO
# --------------------------------------------------------------------------

def seo_payment_succeeded(*, payment, related):
    subscriber = _locked(SeoSubscriber, related)
    if subscriber is None:
        logger.error("Payment %s succeeded for an SEO subscriber that no longer exists.", payment.pk)
        return

    if payment.mode == "payment":
        # A one-off has no subscription events to follow, so this is the only
        # thing that will ever say it was paid.
        subscriber.payment_status = SeoSubscriber.PaymentStatus.PAID
        subscriber.subscription_current_period_end = None
        subscriber.save(update_fields=[
            "payment_status", "subscription_current_period_end", "updated_at",
        ])
    else:
        subscriber.stripe_subscription_id = (
            payment.stripe_subscription_id or subscriber.stripe_subscription_id
        )
        subscriber.payment_status = SeoSubscriber.PaymentStatus.ACTIVE
        subscriber.save(update_fields=[
            "stripe_subscription_id", "payment_status", "updated_at",
        ])
    activate_paid_subscriber(subscriber)


def seo_payment_failed(*, payment, related):
    subscriber = _locked(SeoSubscriber, related)
    if subscriber is None:
        return
    if subscriber.payment_status == SeoSubscriber.PaymentStatus.PAYMENT_PENDING:
        subscriber.save(update_fields=["updated_at"])


def seo_subscription_changed(*, subscription, related):
    subscriber = _locked(SeoSubscriber, related)
    if subscriber is None:
        return
    subscriber.stripe_subscription_id = subscription.stripe_subscription_id
    subscriber.payment_status = _SEO_STATUS.get(
        subscription.status, SeoSubscriber.PaymentStatus.PAYMENT_PENDING
    )
    subscriber.subscription_current_period_end = subscription.current_period_end
    subscriber.cancel_at_period_end = subscription.cancel_at_period_end
    subscriber.save(update_fields=[
        "stripe_subscription_id", "payment_status",
        "subscription_current_period_end", "cancel_at_period_end", "updated_at",
    ])
    if subscriber.payment_status == SeoSubscriber.PaymentStatus.ACTIVE:
        activate_paid_subscriber(subscriber)


def seo_renewal_paid(*, subscription, payment, related):
    subscriber = _locked(SeoSubscriber, related)
    if subscriber is None:
        return
    subscriber.payment_status = SeoSubscriber.PaymentStatus.ACTIVE
    subscriber.subscription_current_period_end = (
        subscription.paid_through or subscriber.subscription_current_period_end
    )
    subscriber.save(update_fields=[
        "payment_status", "subscription_current_period_end", "updated_at",
    ])
    ensure_seo_profile(subscriber)


def seo_refunded(*, payment, related):
    subscriber = _locked(SeoSubscriber, related)
    if subscriber is None:
        return
    logger.warning(
        "SEO subscriber %s was refunded %s on payment %s; access is unchanged.",
        subscriber.pk, payment.refunded_amount, payment.pk,
    )


# --------------------------------------------------------------------------
# Package orders
# --------------------------------------------------------------------------

def package_payment_succeeded(*, payment, related):
    order = _locked(PackageOrder, related)
    if order is None:
        logger.error("Payment %s succeeded for a package order that no longer exists.", payment.pk)
        return
    if order.has_paid:
        # A new event about an order already paid: nothing more to record or say.
        return
    order.payment_status = PackageOrder.PaymentStatus.PAID
    order.paid_at = timezone.now()
    order.save(update_fields=["payment_status", "paid_at", "updated_at"])
    transaction.on_commit(lambda: notify_of_paid_package_order(order))


def package_refunded(*, payment, related):
    order = _locked(PackageOrder, related)
    if order is None:
        return
    logger.warning(
        "Package order %s was refunded %s on payment %s; the order is unchanged.",
        order.pk, payment.refunded_amount, payment.pk,
    )


# --------------------------------------------------------------------------

def register():
    """Tell the shared payments app what each of this site's flows means.

    Called from ``PaymentsConfig.ready`` rather than at import time: the
    callbacks above reach the dealers and seo applications' models, and
    ``ready()`` is the first moment the app registry can answer for them.
    """
    register_handler(
        DEALER_SUBSCRIPTION,
        payment_succeeded=dealer_payment_succeeded,
        payment_failed=dealer_payment_failed,
        subscription_changed=dealer_subscription_changed,
        renewal_paid=dealer_renewal_paid,
        refunded=dealer_refunded,
    )
    for flow in (SEO_SUBSCRIPTION, SEO_ONEOFF):
        register_handler(
            flow,
            payment_succeeded=seo_payment_succeeded,
            payment_failed=seo_payment_failed,
            subscription_changed=seo_subscription_changed,
            renewal_paid=seo_renewal_paid,
            refunded=seo_refunded,
        )
    # One payment and no subscription, so success and refund are the whole story.
    register_handler(
        PACKAGE_ORDER,
        payment_succeeded=package_payment_succeeded,
        refunded=package_refunded,
    )
