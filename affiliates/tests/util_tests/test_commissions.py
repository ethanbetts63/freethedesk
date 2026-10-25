"""A paid audit bought with an affiliate's code owes the affiliate half its list price.

Driven through the Stripe webhook, because that is the only place a commission
is ever made: the SEO payment callback runs inside the event's transaction.
"""

from decimal import Decimal

import pytest
from django.utils import timezone
from freetheplatform.payments import DiscountRedemption, RedemptionStatus
from freetheplatform.payments.models.discount_redemption import customer_key_for

from affiliates.models import Commission
from core.models import SiteSettings
from payments.flows import SEO_ONEOFF
from payments.tests.conftest import stripe_settings
from payments.tests.view_tests.test_stripe_webhook_view import completed, make_payment, post
from seo.models import SeoSubscriber
from seo.tests.factories import SeoSubscriberFactory

pytestmark = pytest.mark.django_db


def _paid_with_code(affiliate, *, email="buyer@example.com", list_price="550.00", session_id="cs_code"):
    """An unpaid audit signup whose checkout reserved the affiliate's code."""
    buyer = SeoSubscriberFactory(
        user=None, email=email, plan=SeoSubscriber.Plan.ESSENTIALS, discount_code=affiliate.code,
        payment_status=SeoSubscriber.PaymentStatus.PAYMENT_PENDING,
    )
    saving = (Decimal(list_price) * affiliate.discount.percentage / 100).quantize(Decimal("0.01"))
    payment = make_payment(buyer, flow=SEO_ONEOFF, mode="payment", total=list_price, session_id=session_id)
    payment.discount_amount = saving
    payment.total_amount = Decimal(list_price) - saving
    payment.save(update_fields=["discount_amount", "total_amount"])
    DiscountRedemption.objects.create(
        discount=affiliate.discount,
        payment=payment,
        customer_key=customer_key_for(buyer),
        amount=saving,
        currency="aud",
        status=RedemptionStatus.RESERVED,
        expires_at=timezone.now() + timezone.timedelta(days=1),
    )
    return buyer, payment


@stripe_settings
def test_a_paid_audit_with_the_code_owes_half_the_list_price(
    client, affiliate, outbox, django_capture_on_commit_callbacks
):
    buyer, payment = _paid_with_code(affiliate)

    with django_capture_on_commit_callbacks(execute=True):
        response = post(client, completed(payment))

    assert response.status_code == 200
    commission = Commission.objects.get()
    assert commission.affiliate == affiliate
    assert commission.payment == payment
    assert commission.description == "Essentials SEO audit"
    assert commission.sale_amount == Decimal("550.00")
    # Half of the list price, not of the $440 the listener paid.
    assert commission.amount == Decimal("275.00")
    assert commission.status == Commission.Status.OWED
    buyer.refresh_from_db()
    assert buyer.payment_status == SeoSubscriber.PaymentStatus.PAID
    assert any(m.to == affiliate.email and "275.00" in m.body_text for m in outbox)


@stripe_settings
def test_the_same_payment_twice_owes_once(client, affiliate):
    _, payment = _paid_with_code(affiliate)

    post(client, completed(payment))
    post(client, completed(payment, event_id="evt_again"))

    assert Commission.objects.count() == 1


@stripe_settings
def test_the_share_follows_the_setting(client, affiliate):
    settings = SiteSettings.load()
    settings.affiliate_share_percent = 40
    settings.save()
    _, payment = _paid_with_code(affiliate)

    post(client, completed(payment))

    assert Commission.objects.get().amount == Decimal("220.00")


@stripe_settings
def test_a_payment_without_a_code_owes_nobody(client, affiliate):
    buyer = SeoSubscriberFactory(user=None, email="buyer@example.com")
    payment = make_payment(buyer, flow=SEO_ONEOFF, mode="payment", total="550.00")

    post(client, completed(payment))

    assert not Commission.objects.exists()


@stripe_settings
def test_the_affiliate_buying_with_their_own_code_earns_nothing(
    client, affiliate, outbox, django_capture_on_commit_callbacks
):
    _, payment = _paid_with_code(affiliate, email=affiliate.email.upper())

    with django_capture_on_commit_callbacks(execute=True):
        post(client, completed(payment))

    commission = Commission.objects.get()
    assert commission.status == Commission.Status.VOID
    assert commission.amount == 0
    assert "own code" in commission.note
    assert not any(m.to == affiliate.email for m in outbox)


@stripe_settings
def test_a_refund_takes_back_an_owed_commission_and_leaves_a_paid_one(client, affiliate):
    _, payment = _paid_with_code(affiliate)
    post(client, completed(payment, payment_intent="pi_refund"))
    # What Stripe's own charge event records before anyone can refund it.
    payment.stripe_charge_id = "ch_1"
    payment.save(update_fields=["stripe_charge_id"])

    post(client, {
        "id": "evt_refund",
        "type": "charge.refunded",
        "created": 1798761600,
        "data": {"object": {
            "id": "ch_1", "payment_intent": "pi_refund", "amount_refunded": 44000, "currency": "aud",
        }},
    })

    commission = Commission.objects.get()
    assert commission.status == Commission.Status.VOID
    assert "Refunded" in commission.note

    commission.status = Commission.Status.PAID
    commission.note = ""
    commission.save()
    from affiliates.utils.commissions import void_commission

    void_commission(payment, reason="Refunded again.")
    commission.refresh_from_db()
    assert commission.status == Commission.Status.PAID
