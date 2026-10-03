import pytest
from django.contrib.auth import get_user_model
from freetheplatform.auth import lockout

from seo.models import SeoSubscriber
from seo.tests.factories import SeoSubscriberFactory
from seo.utils.services import DUPLICATE_PAYMENT_NOTE, activate_paid_subscriber

pytestmark = pytest.mark.django_db


@pytest.fixture
def signup():
    """What the signup form leaves: details and no login."""
    return SeoSubscriberFactory(user=None, email="jo@peakdigital.com.au")


def test_payment_makes_the_login_and_hands_over_a_password(
    signup, outbox, django_capture_on_commit_callbacks
):
    with django_capture_on_commit_callbacks(execute=True):
        activate_paid_subscriber(signup)

    signup.refresh_from_db()
    assert signup.status == SeoSubscriber.Status.ACTIVE
    assert signup.user.email == signup.user.username == "jo@peakdigital.com.au"
    assert signup.user.has_usable_password()
    assert lockout.state_for(signup.user).must_change_password
    [welcome] = outbox
    assert welcome.message_type == "seo.welcome"
    assert welcome.to == "jo@peakdigital.com.au"
    assert "Temporary password:" in welcome.body_text
    assert "/seo-portal/setup" in welcome.body_text


def test_a_second_payment_event_changes_nothing(
    signup, outbox, django_capture_on_commit_callbacks
):
    # Stripe sends a checkout and a subscription event for one purchase, and
    # both activate. Only the first may mint a password or send an email: a
    # second password would lock out whoever is using the first.
    with django_capture_on_commit_callbacks(execute=True):
        activate_paid_subscriber(signup)
    signup.user.refresh_from_db()
    first_hash = signup.user.password

    with django_capture_on_commit_callbacks(execute=True):
        activate_paid_subscriber(signup)

    signup.user.refresh_from_db()
    assert signup.user.password == first_hash
    assert get_user_model().objects.count() == 1
    assert len(outbox) == 1


def test_payment_reuses_a_login_the_old_signup_left_behind(
    signup, django_capture_on_commit_callbacks
):
    # The old flow made a passwordless login at signup; its username is the
    # email, so a new one could not be made beside it.
    leftover = get_user_model().objects.create_user(username=signup.email, email=signup.email)

    with django_capture_on_commit_callbacks(execute=True):
        activate_paid_subscriber(signup)

    signup.refresh_from_db()
    assert signup.user == leftover
    assert signup.status == SeoSubscriber.Status.ACTIVE


def test_payment_for_an_email_with_an_account_waits_for_staff(
    signup, outbox, django_capture_on_commit_callbacks
):
    # Checkout refuses this email, so it is a race; the money is in and there
    # is no login to give it to.
    get_user_model().objects.create_user(username=signup.email, email=signup.email, password="x")

    for _ in range(2):
        with django_capture_on_commit_callbacks(execute=True):
            activate_paid_subscriber(signup)

    signup.refresh_from_db()
    assert signup.user is None
    assert signup.status == SeoSubscriber.Status.PENDING
    assert DUPLICATE_PAYMENT_NOTE in signup.staff_notes
    [alert] = outbox
    assert alert.message_type == "seo.staff_duplicate_payment"


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
