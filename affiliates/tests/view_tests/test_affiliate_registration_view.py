import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from freetheplatform.agreements import Acceptance
from freetheplatform.auth import lockout
from freetheplatform.payments import DiscountCode

from affiliates.models import Affiliate
from core.models import SiteSettings
from payments.flows import SEO_ONEOFF
from seo.models import SeoProfile, SeoSubscriber
from seo.tests.factories import SeoSubscriberFactory

pytestmark = pytest.mark.django_db

PAYLOAD = {
    "contact_name": "Sam Host",
    "email": "Sam@TheTradieShow.com.au",
    "business_name": "The Tradie Show",
    "website": "https://www.thetradieshow.com.au",
    "accepted_terms": True,
}


def signup(client, **overrides):
    return client.post(
        reverse("affiliate-signup"), {**PAYLOAD, **overrides}, content_type="application/json"
    )


def test_signing_up_opens_the_account_with_a_code_and_a_free_audit(client, outbox):
    response = signup(client)

    assert response.status_code == 201
    assert response.json() == {"email": "sam@thetradieshow.com.au"}
    assert "freethedesk_access" not in response.cookies

    affiliate = Affiliate.objects.get()
    assert affiliate.status == Affiliate.Status.ACTIVE
    assert affiliate.email == "sam@thetradieshow.com.au"
    assert affiliate.user.email == "sam@thetradieshow.com.au"
    assert affiliate.code == "THETRADIESHOW20"

    code = affiliate.discount
    assert code.kind == "percentage"
    assert code.percentage == 20
    assert code.flows == [SEO_ONEOFF]
    assert code.owner == affiliate

    audit = SeoSubscriber.objects.get(user=affiliate.user)
    assert audit.plan == SeoSubscriber.Plan.PLUS
    assert audit.payment_status == SeoSubscriber.PaymentStatus.COMPLIMENTARY
    assert audit.status == SeoSubscriber.Status.ACTIVE
    assert audit.has_paid
    assert SeoProfile.objects.get(subscriber=audit).website_url == PAYLOAD["website"]


def test_signing_up_emails_a_verification_code_and_tells_staff(client, outbox):
    signup(client)

    affiliate = Affiliate.objects.get()
    state = lockout.state_for(affiliate.user)
    assert state.must_change_password
    assert affiliate.user.has_usable_password()

    welcome = [m for m in outbox if m.to == affiliate.email]
    assert len(welcome) == 1
    assert "Your verification code:" in welcome[0].body_text
    assert "/affiliates/verify?email=sam@thetradieshow.com.au" in welcome[0].body_text
    assert "THETRADIESHOW20" in welcome[0].body_text
    staff = [m for m in outbox if m.to != affiliate.email]
    assert any("THETRADIESHOW20" in m.body_text for m in staff)


def test_signing_up_records_the_terms(client):
    signup(client)

    affiliate = Affiliate.objects.get()
    acceptance = Acceptance.objects.for_related(affiliate).get()
    assert acceptance.agreement_version.agreement.key == "affiliate.program"
    assert acceptance.context["code"] == "THETRADIESHOW20"
    assert acceptance.context["discount_percent"] == 20
    assert acceptance.context["share_percent"] == 50


def test_the_code_follows_the_discount_setting_on_the_day(client):
    settings = SiteSettings.load()
    settings.affiliate_discount_percent = 25
    settings.save()

    signup(client)

    assert Affiliate.objects.get().code == "THETRADIESHOW25"


def test_a_second_show_with_the_same_name_gets_a_different_code(client):
    signup(client)
    signup(client, email="other@example.com")

    codes = sorted(DiscountCode.objects.values_list("code", flat=True))
    assert codes == ["THETRADIESHOW20", "THETRADIESHOW20-2"]


def test_an_email_with_an_account_is_refused_so_the_page_offers_sign_in(client):
    SeoSubscriberFactory(user__username="sam@thetradieshow.com.au")

    response = signup(client)

    assert response.status_code == 400
    assert response.json()["code"] == "account_exists"
    assert not Affiliate.objects.exists()


def test_the_website_is_optional_but_the_terms_are_not(client):
    assert signup(client, website="").status_code == 201

    response = signup(client, email="two@example.com", accepted_terms=False)

    assert response.status_code == 400
    assert "accepted_terms" in response.json()
    assert Affiliate.objects.count() == 1


def test_a_stale_passwordless_login_is_reused_rather_than_refused(client):
    stale = get_user_model().objects.create_user(
        username="sam@thetradieshow.com.au", email="sam@thetradieshow.com.au", password=None
    )

    response = signup(client)

    assert response.status_code == 201
    assert Affiliate.objects.get().user == stale
