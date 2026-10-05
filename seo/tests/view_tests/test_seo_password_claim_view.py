from datetime import timedelta

import pytest
from django.core.cache import cache
from django.urls import reverse
from django.utils import timezone
from freetheplatform.auth import lockout
from freetheplatform.auth.conf import cookie_names

from seo.models import SeoSubscriber
from seo.tests.factories import SeoSubscriberFactory
from seo.utils.password_claim import issue_password_claim
from seo.utils.services import activate_paid_subscriber

pytestmark = pytest.mark.django_db

NEW_PASSWORD = "a-long-new-passphrase-2026"


@pytest.fixture(autouse=True)
def _clear_throttle_cache():
    cache.clear()


@pytest.fixture
def paid():
    """A signup whose browser holds the claim, just activated by payment."""
    signup = SeoSubscriberFactory(user=None, email="jo@peakdigital.com.au")
    token = issue_password_claim(signup)
    signup.payment_status = SeoSubscriber.PaymentStatus.ACTIVE
    signup.save(update_fields=["payment_status"])
    activate_paid_subscriber(signup)
    signup.refresh_from_db()
    return signup, token


def _claim(client, signup, token, password=NEW_PASSWORD):
    return client.post(
        reverse("seo-password-claim", args=[signup.checkout_reference]),
        {"claim": token, "password": password},
        content_type="application/json",
    )


def test_the_signup_browser_sets_the_first_password_and_is_signed_in(client, paid):
    signup, token = paid

    response = _claim(client, signup, token)

    assert response.status_code == 200
    access_cookie, refresh_cookie = cookie_names()
    assert response.cookies[access_cookie].value
    assert response.cookies[refresh_cookie].value
    signup.refresh_from_db()
    assert signup.user.check_password(NEW_PASSWORD)
    assert not lockout.state_for(signup.user).must_change_password
    assert signup.password_claim_hash == ""


def test_a_claim_works_once(client, paid):
    signup, token = paid
    assert _claim(client, signup, token).status_code == 200

    second = _claim(client, signup, token, password="another-long-passphrase-9")

    assert second.status_code == 403
    signup.refresh_from_db()
    assert signup.user.check_password(NEW_PASSWORD)


def test_the_reference_alone_is_not_enough(client, paid):
    # The reference is in the URL, browser history and Stripe's records.
    signup, _ = paid

    response = _claim(client, signup, "not-the-token")

    assert response.status_code == 403
    assert response.json()["code"] == "claim_unavailable"
    signup.refresh_from_db()
    assert lockout.state_for(signup.user).must_change_password


def test_nothing_to_claim_before_payment(client):
    signup = SeoSubscriberFactory(user=None)
    token = issue_password_claim(signup)

    assert _claim(client, signup, token).status_code == 403


def test_the_window_closes_an_hour_after_payment(client, paid):
    signup, token = paid
    SeoSubscriber.objects.filter(pk=signup.pk).update(
        status_changed_at=timezone.now() - timedelta(hours=1, minutes=1)
    )

    assert _claim(client, signup, token).status_code == 403


def test_an_account_already_on_its_own_password_has_nothing_to_claim(client, paid):
    # Signed in with the emailed password and replaced it: the claim is spent.
    signup, token = paid
    state = lockout.state_for(signup.user)
    state.must_change_password = False
    state.save(update_fields=["must_change_password"])

    assert _claim(client, signup, token).status_code == 403


def test_a_weak_password_is_refused_and_the_claim_kept(client, paid):
    signup, token = paid

    response = _claim(client, signup, token, password="short")

    assert response.status_code == 400
    assert "password" in response.json()
    assert _claim(client, signup, token).status_code == 200


def test_an_unknown_reference_answers_like_a_wrong_token(client):
    response = client.post(
        reverse("seo-password-claim", args=["no-such-reference"]),
        {"claim": "x", "password": NEW_PASSWORD},
        content_type="application/json",
    )
    assert response.status_code == 403
