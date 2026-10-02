import pytest
from freetheplatform.auth import lockout

from seo.models import SeoSubscriber
from seo.utils.services import activate_paid_subscriber

pytestmark = pytest.mark.django_db


@pytest.fixture
def passwordless(seo_subscriber):
    seo_subscriber.user.set_unusable_password()
    seo_subscriber.user.save(update_fields=["password"])
    return seo_subscriber


def test_payment_opens_the_account_and_hands_over_a_password(
    passwordless, outbox, django_capture_on_commit_callbacks
):
    with django_capture_on_commit_callbacks(execute=True):
        activate_paid_subscriber(passwordless)

    passwordless.refresh_from_db()
    assert passwordless.status == SeoSubscriber.Status.ACTIVE
    assert passwordless.user.has_usable_password()
    assert lockout.state_for(passwordless.user).must_change_password
    [welcome] = outbox
    assert welcome.message_type == "seo.welcome"
    assert "Temporary password:" in welcome.body_text
    assert "/seo-portal/setup" in welcome.body_text


def test_a_second_payment_event_changes_nothing(
    passwordless, outbox, django_capture_on_commit_callbacks
):
    # Stripe sends a checkout and a subscription event for one purchase, and
    # both activate. Only the first may mint a password or send an email: a
    # second password would lock out whoever is using the first.
    with django_capture_on_commit_callbacks(execute=True):
        activate_paid_subscriber(passwordless)
    passwordless.user.refresh_from_db()
    first_hash = passwordless.user.password

    with django_capture_on_commit_callbacks(execute=True):
        activate_paid_subscriber(passwordless)

    passwordless.user.refresh_from_db()
    assert passwordless.user.password == first_hash
    assert len(outbox) == 1


def test_an_account_with_its_own_password_keeps_it(
    seo_subscriber, outbox, django_capture_on_commit_callbacks
):
    with django_capture_on_commit_callbacks(execute=True):
        activate_paid_subscriber(seo_subscriber)

    seo_subscriber.user.refresh_from_db()
    assert seo_subscriber.user.check_password("Sturdy-Passphrase-42")
    assert not lockout.state_for(seo_subscriber.user).must_change_password
    [welcome] = outbox
    assert "Temporary password" not in welcome.body_text
