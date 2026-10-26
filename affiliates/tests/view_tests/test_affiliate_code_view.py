from decimal import Decimal

import pytest
from django.urls import reverse
from django.utils import timezone
from freetheplatform.payments import DiscountCode, DiscountRedemption, RedemptionStatus
from freetheplatform.payments.models.discount_redemption import customer_key_for

from affiliates.models import Affiliate
from affiliates.tests.factories import AffiliateFactory
from affiliates.utils.codes import CODE_LIMIT, affiliate_codes, create_named_code
from affiliates.utils.commissions import affiliate_for_payment
from payments.flows import SEO_ONEOFF
from payments.tests.view_tests.test_stripe_webhook_view import make_payment
from seo.tests.factories import SeoSubscriberFactory

pytestmark = pytest.mark.django_db


def _codes(body):
    return [entry["code"] for entry in body["codes"]]


def test_an_affiliate_adds_a_code_of_their_own(client, affiliate):
    client.sign_in(affiliate.user)

    response = client.post(reverse("affiliate-codes"), {"code": " sparky "}, format="json")

    assert response.status_code == 201
    body = response.json()
    assert body["code"] == "THETRADIESHOW20"
    assert _codes(body) == ["THETRADIESHOW20", "SPARKY"]
    added = body["codes"][1]
    assert added["share_link"].endswith("/seo?code=SPARKY")
    assert added["removable"] is True and body["codes"][0]["removable"] is False
    code = DiscountCode.objects.get(code="SPARKY")
    assert code.percentage == affiliate.discount.percentage
    assert code.flows == [SEO_ONEOFF]
    assert code.owner == affiliate


def test_a_taken_code_is_refused_whatever_its_case_or_spacing(client, affiliate):
    other = AffiliateFactory(user__username="other@example.com", business_name="Other Show")
    create_named_code(other, "SPARKY")
    client.sign_in(affiliate.user)

    response = client.post(reverse("affiliate-codes"), {"code": "spar ky"}, format="json")

    assert response.status_code == 400
    assert response.json()["code"] == ["That code is taken. Try another."]
    assert _codes(client.get(reverse("affiliate-account")).json()) == ["THETRADIESHOW20"]


@pytest.mark.parametrize("bad", ["ab", "a" * 25, "dollar$", "under_score", ""])
def test_a_code_must_be_letters_digits_or_hyphens(client, affiliate, bad):
    client.sign_in(affiliate.user)

    response = client.post(reverse("affiliate-codes"), {"code": bad}, format="json")

    assert response.status_code == 400
    assert "3 to 24" in response.json()["code"][0]


def test_an_affiliate_holds_at_most_the_limit(client, affiliate):
    for index in range(CODE_LIMIT - 1):
        create_named_code(affiliate, f"CODE{index}")
    client.sign_in(affiliate.user)

    response = client.post(reverse("affiliate-codes"), {"code": "ONEMORE"}, format="json")

    assert response.status_code == 400
    assert "most" in response.json()["code"][0]
    assert affiliate_codes(affiliate).count() == CODE_LIMIT


def test_a_suspended_affiliate_cannot_add_codes(client, affiliate):
    affiliate.status = Affiliate.Status.SUSPENDED
    affiliate.save(update_fields=["status"])
    client.sign_in(affiliate.user)

    response = client.post(reverse("affiliate-codes"), {"code": "SPARKY"}, format="json")

    assert response.status_code == 400
    assert "active" in response.json()["code"][0]


def test_a_deleted_code_is_switched_off_and_leaves_the_list_but_the_primary_cannot_be(client, affiliate):
    added = create_named_code(affiliate, "SPARKY")
    client.sign_in(affiliate.user)

    response = client.delete(reverse("affiliate-code", args=[added.pk]))

    assert response.status_code == 200
    added.refresh_from_db()
    assert added.is_active is False
    assert _codes(response.json()) == ["THETRADIESHOW20"]

    refused = client.delete(reverse("affiliate-code", args=[affiliate.discount.pk]))
    assert refused.status_code == 400
    assert "primary code" in refused.json()["code"][0]


def test_adding_a_deleted_name_again_brings_the_same_code_back(client, affiliate):
    added = create_named_code(affiliate, "SPARKY")
    client.sign_in(affiliate.user)
    client.delete(reverse("affiliate-code", args=[added.pk]))

    response = client.post(reverse("affiliate-codes"), {"code": "sparky"}, format="json")

    assert response.status_code == 201
    assert _codes(response.json()) == ["THETRADIESHOW20", "SPARKY"]
    added.refresh_from_db()
    assert added.is_active is True
    assert affiliate_codes(affiliate).count() == 2


def test_an_affiliate_moves_the_primary_to_another_code(client, affiliate):
    signup = affiliate.discount
    added = create_named_code(affiliate, "SPARKY")
    client.sign_in(affiliate.user)

    response = client.patch(
        reverse("affiliate-code", args=[added.pk]),
        {"primary": True},
        content_type="application/json",
    )

    assert response.status_code == 200
    body = response.json()
    assert body["code"] == "SPARKY"
    assert body["share_link"].endswith("/seo?code=SPARKY")
    primary = {entry["code"]: entry["is_primary"] for entry in body["codes"]}
    assert primary == {"THETRADIESHOW20": False, "SPARKY": True}
    removable = {entry["code"]: entry["removable"] for entry in body["codes"]}
    assert removable == {"THETRADIESHOW20": True, "SPARKY": False}

    # The old primary can now go, and the new one cannot.
    assert client.delete(reverse("affiliate-code", args=[signup.pk])).status_code == 200
    assert client.delete(reverse("affiliate-code", args=[added.pk])).status_code == 400


def test_a_deleted_or_foreign_code_cannot_be_made_primary(client, affiliate):
    added = create_named_code(affiliate, "SPARKY")
    other = AffiliateFactory(user__username="other@example.com", business_name="Other Show")
    theirs = create_named_code(other, "THEIRS")
    client.sign_in(affiliate.user)
    client.delete(reverse("affiliate-code", args=[added.pk]))

    for pk in (added.pk, theirs.pk):
        response = client.patch(
            reverse("affiliate-code", args=[pk]), {"primary": True}, content_type="application/json"
        )
        assert response.status_code == 400
    affiliate.refresh_from_db()
    assert affiliate.code == "THETRADIESHOW20"

    missing_flag = client.patch(
        reverse("affiliate-code", args=[affiliate.discount.pk]), {}, content_type="application/json"
    )
    assert missing_flag.status_code == 400


def test_an_affiliate_cannot_touch_another_affiliates_code(client, affiliate):
    other = AffiliateFactory(user__username="other@example.com", business_name="Other Show")
    theirs = create_named_code(other, "THEIRS")
    client.sign_in(affiliate.user)

    response = client.delete(reverse("affiliate-code", args=[theirs.pk]))

    assert response.status_code == 400
    theirs.refresh_from_db()
    assert theirs.is_active is True


def test_a_sale_with_an_added_code_is_the_affiliates(affiliate):
    added = create_named_code(affiliate, "SPARKY")
    buyer = SeoSubscriberFactory(user=None, email="buyer@example.com")
    payment = make_payment(buyer, flow=SEO_ONEOFF, mode="payment", total="550.00", session_id="cs_added")
    DiscountRedemption.objects.create(
        discount=added,
        payment=payment,
        customer_key=customer_key_for(buyer),
        amount=Decimal("110.00"),
        currency="aud",
        status=RedemptionStatus.RESERVED,
        expires_at=timezone.now() + timezone.timedelta(days=1),
    )

    assert affiliate_for_payment(payment) == affiliate


def test_codes_need_an_affiliate_login(client):
    response = client.post(reverse("affiliate-codes"), {"code": "SPARKY"}, format="json")

    assert response.status_code in (401, 403)
