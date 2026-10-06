"""FreeTheDesk's end of the shared webhook.

The package's own tests prove it handles duplicates, ordering and failure.
These prove the wiring: that the URL reaches it, that the flows registered in
``payments/fulfilment.py`` are the ones it calls, and that a dealer or subscriber
ends up in the state this site expects.
"""

import re
from decimal import Decimal
from unittest.mock import patch

import pytest
from django.contrib.contenttypes.models import ContentType
from django.urls import reverse
from freetheplatform.auth import lockout
from freetheplatform.payments import Payment, PaymentStatus, Subscription

from dealers.models import Dealer, DealerProfile
from payments.flows import DEALER_SUBSCRIPTION, SEO_ONEOFF, SEO_SUBSCRIPTION
from payments.tests.conftest import stripe_settings
from seo.models import SeoSubscriber

pytestmark = pytest.mark.django_db


WEBHOOK = "payments:ftp_payments:stripe-webhook"


def post(client, event):
    with patch("freetheplatform.payments.client.construct_event", return_value=event):
        return client.post(
            reverse(WEBHOOK), data=b"{}", content_type="application/json",
            HTTP_STRIPE_SIGNATURE="test-signature",
        )


def make_payment(related, *, flow, mode="subscription", total="199.00", session_id="cs_test"):
    return Payment.objects.create(
        flow=flow,
        related_content_type=ContentType.objects.get_for_model(related),
        related_object_id=str(related.pk),
        related_label=getattr(related, "business_name", ""),
        mode=mode,
        status=PaymentStatus.PENDING,
        currency="aud",
        subtotal_amount=Decimal(total),
        total_amount=Decimal(total),
        tax_mode="none",
        quote={"total": total, "currency": "aud"},
        quote_sha256="a" * 64,
        stripe_checkout_session_id=session_id,
    )


def completed(payment, **overrides):
    obj = {
        "id": payment.stripe_checkout_session_id,
        "mode": payment.mode,
        "payment_status": "paid",
        "amount_total": int(payment.total_amount * 100),
        "currency": "aud",
        "metadata": {"ftp_payment": str(payment.id)},
    }
    obj.update(overrides)
    return {
        "id": overrides.pop("event_id", "evt_1"),
        "type": "checkout.session.completed",
        "created": 1798761600,
        "data": {"object": obj},
    }


# --------------------------------------------------------------------------
# Dealer
# --------------------------------------------------------------------------

@stripe_settings
def test_a_paid_checkout_activates_the_dealer(client, dealer):
    payment = make_payment(dealer, flow=DEALER_SUBSCRIPTION)
    response = post(client, completed(payment, subscription="sub_test"))

    assert response.status_code == 200
    dealer.refresh_from_db()
    assert dealer.payment_status == Dealer.PaymentStatus.ACTIVE
    assert dealer.stripe_subscription_id == "sub_test"
    assert DealerProfile.objects.filter(dealer=dealer).exists()


@stripe_settings
def test_the_same_event_twice_activates_once(client, dealer):
    payment = make_payment(dealer, flow=DEALER_SUBSCRIPTION)
    event = completed(payment, subscription="sub_test")

    assert post(client, event).status_code == 200
    second = post(client, event)

    assert second.json()["outcome"] == "duplicate"
    assert DealerProfile.objects.filter(dealer=dealer).count() == 1


@stripe_settings
def test_a_subscription_is_tracked_so_renewals_can_be_recorded(client, dealer):
    payment = make_payment(dealer, flow=DEALER_SUBSCRIPTION)
    post(client, completed(payment, subscription="sub_test"))

    tracked = Subscription.objects.get(stripe_subscription_id="sub_test")
    assert tracked.flow == DEALER_SUBSCRIPTION
    assert tracked.related == dealer


@stripe_settings
def test_a_paid_renewal_advances_the_dealer(client, dealer):
    payment = make_payment(dealer, flow=DEALER_SUBSCRIPTION)
    post(client, completed(payment, subscription="sub_test"))
    dealer.refresh_from_db()

    period_end = 1801440000
    post(client, {
        "id": "evt_renewal",
        "type": "invoice.paid",
        "created": 1798761600,
        "data": {"object": {
            "id": "in_1", "subscription": "sub_test",
            "amount_paid": 19900, "currency": "aud", "period_end": period_end,
        }},
    })

    dealer.refresh_from_db()
    assert dealer.payment_status == Dealer.PaymentStatus.ACTIVE
    # A renewal that was actually paid, which is a different claim from the
    # subscription merely being 'active'.
    assert Subscription.objects.get(stripe_subscription_id="sub_test").paid_through


@stripe_settings
def test_a_cancelled_subscription_cancels_the_dealer(client, dealer):
    payment = make_payment(dealer, flow=DEALER_SUBSCRIPTION)
    post(client, completed(payment, subscription="sub_test"))

    subscription = {
        "id": "sub_test", "status": "canceled",
        "current_period_end": 1801440000, "cancel_at_period_end": False,
    }
    with patch("freetheplatform.payments.client.get_client") as get_client:
        get_client.return_value.subscriptions.retrieve.return_value = subscription
        post(client, {
            "id": "evt_cancel",
            "type": "customer.subscription.deleted",
            "created": 1798761600,
            "data": {"object": subscription},
        })

    dealer.refresh_from_db()
    assert dealer.payment_status == Dealer.PaymentStatus.CANCELLED


@stripe_settings
def test_an_invalid_signature_changes_nothing(client, dealer):
    import stripe

    make_payment(dealer, flow=DEALER_SUBSCRIPTION)
    with patch(
        "freetheplatform.payments.client.construct_event",
        side_effect=stripe.SignatureVerificationError("bad", "sig"),
    ):
        response = client.post(
            reverse(WEBHOOK), data=b"{}", content_type="application/json",
            HTTP_STRIPE_SIGNATURE="forged",
        )

    assert response.status_code == 400
    dealer.refresh_from_db()
    assert dealer.payment_status == Dealer.PaymentStatus.PAYMENT_PENDING


@stripe_settings
def test_an_amount_that_disagrees_with_the_quote_does_not_activate(client, dealer):
    payment = make_payment(dealer, flow=DEALER_SUBSCRIPTION)
    post(client, completed(payment, amount_total=100))

    dealer.refresh_from_db()
    assert dealer.payment_status == Dealer.PaymentStatus.PAYMENT_PENDING


# --------------------------------------------------------------------------
# SEO
# --------------------------------------------------------------------------

@stripe_settings
def test_a_paid_seo_subscription_activates_the_subscriber(client, seo_subscriber):
    payment = make_payment(seo_subscriber, flow=SEO_SUBSCRIPTION, total="150.00")
    post(client, completed(payment, subscription="sub_seo"))

    seo_subscriber.refresh_from_db()
    assert seo_subscriber.payment_status == SeoSubscriber.PaymentStatus.ACTIVE
    assert seo_subscriber.stripe_subscription_id == "sub_seo"


@stripe_settings
def test_a_paid_seo_subscription_emails_a_temporary_password(
    client, seo_subscriber, outbox, django_capture_on_commit_callbacks
):
    # Signup creates the login without a password; payment is what hands one over.
    seo_subscriber.user.set_unusable_password()
    seo_subscriber.user.save(update_fields=["password"])
    payment = make_payment(seo_subscriber, flow=SEO_SUBSCRIPTION, total="150.00")

    with django_capture_on_commit_callbacks(execute=True):
        post(client, completed(payment, subscription="sub_seo"))

    seo_subscriber.refresh_from_db()
    assert seo_subscriber.status == SeoSubscriber.Status.ACTIVE
    [welcome] = [m for m in outbox if m.to == "seo@example.com"]
    password = re.search(r"Your verification code: (\S+)", welcome.body_text).group(1)
    assert seo_subscriber.user.check_password(password)
    assert lockout.state_for(seo_subscriber.user).must_change_password


@stripe_settings
def test_a_one_off_seo_purchase_is_marked_paid(client, seo_subscriber):
    # A one-off has no subscription events to follow, so the checkout event is
    # the only thing that will ever say it was paid.
    payment = make_payment(
        seo_subscriber, flow=SEO_ONEOFF, mode="payment", total="99.00",
    )
    post(client, completed(payment, payment_intent="pi_seo"))

    seo_subscriber.refresh_from_db()
    assert seo_subscriber.payment_status == SeoSubscriber.PaymentStatus.PAID
    assert seo_subscriber.subscription_current_period_end is None


@stripe_settings
def test_an_seo_event_does_not_touch_a_dealer(client, dealer, seo_subscriber):
    payment = make_payment(seo_subscriber, flow=SEO_SUBSCRIPTION, total="150.00")
    post(client, completed(payment, subscription="sub_seo"))

    dealer.refresh_from_db()
    assert dealer.payment_status == Dealer.PaymentStatus.PAYMENT_PENDING


# --------------------------------------------------------------------------
# Failure is visible
# --------------------------------------------------------------------------

@stripe_settings
def test_a_failing_handler_returns_an_error_so_stripe_retries(client, dealer):
    from freetheplatform.payments import WebhookEvent

    payment = make_payment(dealer, flow=DEALER_SUBSCRIPTION)
    with patch(
        "payments.fulfilment.ensure_dealer_profile", side_effect=RuntimeError("boom")
    ):
        with pytest.raises(RuntimeError):
            post(client, completed(payment))

    dealer.refresh_from_db()
    assert dealer.payment_status == Dealer.PaymentStatus.PAYMENT_PENDING
    # The work rolled back; the reason did not.
    record = WebhookEvent.objects.get()
    assert record.status == "failed"
    assert "boom" in record.last_error
