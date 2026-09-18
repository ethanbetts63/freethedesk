"""The password controls, wired up here rather than only existing in the package.

The package proves lockout counts and reset tokens behave. What these prove is
that this product routes them, throttles them, and actually sends the email —
none of which the package can assert on its own.
"""

import pytest
from django.core.cache import cache
from freetheplatform.auth import lockout
from freetheplatform.auth.throttling import PasswordResetThrottle

from core.tests.factories import UserFactory

pytestmark = pytest.mark.django_db

PASSWORD = "test-password-123"
NEW_PASSWORD = "an-entirely-different-one"
LOGIN = "/api/token/"
CHANGE = "/api/auth/password/change/"
RESET = "/api/auth/password/reset/"
CONFIRM = "/api/auth/password/reset/confirm/"


@pytest.fixture(autouse=True)
def clear_throttle_history():
    """Throttle counters live in the process cache and outlast a rollback."""
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def staff_user():
    return UserFactory(username="admin", password=PASSWORD, is_staff=True)


def sign_in(api_client, user):
    response = api_client.post(
        LOGIN, {"username": user.get_username(), "password": PASSWORD}, format="json"
    )
    assert response.status_code == 200
    return response


class TestLockout:
    def test_an_account_locks_and_the_correct_password_stops_working(
        self, api_client, staff_user, settings
    ):
        settings.FTP_AUTH = {**settings.FTP_AUTH, "LOCKOUT_THRESHOLD": 3}
        for _ in range(3):
            api_client.post(LOGIN, {"username": "admin", "password": "wrong"}, format="json")

        response = api_client.post(
            LOGIN, {"username": "admin", "password": PASSWORD}, format="json"
        )

        assert response.status_code == 401
        assert lockout.is_locked(staff_user)

    def test_locking_emails_staff(self, api_client, staff_user, settings, outbox):
        """A lock nobody hears about is also the only warning that one happened."""
        settings.FTP_AUTH = {**settings.FTP_AUTH, "LOCKOUT_THRESHOLD": 2, "LOCKOUT_ALERT_AFTER": 2}

        for _ in range(2):
            api_client.post(LOGIN, {"username": "admin", "password": "wrong"}, format="json")

        assert [message.to for message in outbox] == [settings.ADMIN_EMAIL]
        assert "admin" in outbox[0].subject


class TestPasswordReset:
    def test_a_request_sends_a_link_to_the_account(self, api_client, staff_user, outbox):
        staff_user.email = "admin@example.com"
        staff_user.save(update_fields=["email"])

        response = api_client.post(RESET, {"email": "admin@example.com"}, format="json")

        assert response.status_code == 200
        assert outbox[0].to == "admin@example.com"
        assert "/reset-password/" in outbox[0].body_text

    def test_an_unknown_address_answers_identically_and_sends_nothing(
        self, api_client, staff_user, outbox
    ):
        """Otherwise the form is a way of testing whether somebody is a customer."""
        staff_user.email = "admin@example.com"
        staff_user.save(update_fields=["email"])
        known = api_client.post(RESET, {"email": "admin@example.com"}, format="json")
        outbox.clear()

        unknown = api_client.post(RESET, {"email": "nobody@example.com"}, format="json")

        assert (unknown.status_code, unknown.data) == (known.status_code, known.data)
        assert outbox == []

    def test_the_link_sets_a_new_password(self, api_client, staff_user, outbox):
        staff_user.email = "admin@example.com"
        staff_user.save(update_fields=["email"])
        api_client.post(RESET, {"email": "admin@example.com"}, format="json")
        link = outbox[0].body_text.split("/reset-password/")[1].split()[0]
        uid, token = link.split("/")

        response = api_client.post(
            CONFIRM, {"uid": uid, "token": token, "new_password": NEW_PASSWORD}, format="json"
        )

        assert response.status_code == 200
        staff_user.refresh_from_db()
        assert staff_user.check_password(NEW_PASSWORD)

    def test_requests_are_throttled(self, api_client, staff_user, monkeypatch):
        """Each accepted one sends an email, so this is a spend limit too.

        The rate is patched on the throttle rather than in settings: DRF binds
        THROTTLE_RATES as a class attribute at import, so a settings override
        would pass while proving nothing.
        """
        monkeypatch.setitem(PasswordResetThrottle.THROTTLE_RATES, "password_reset", "2/hour")
        for _ in range(2):
            api_client.post(RESET, {"email": "admin@example.com"}, format="json")

        response = api_client.post(RESET, {"email": "admin@example.com"}, format="json")

        assert response.status_code == 429


class TestPasswordChange:
    def test_it_changes_the_password(self, api_client, staff_user):
        sign_in(api_client, staff_user)

        response = api_client.post(
            CHANGE,
            {"current_password": PASSWORD, "new_password": NEW_PASSWORD},
            format="json",
        )

        assert response.status_code == 200
        staff_user.refresh_from_db()
        assert staff_user.check_password(NEW_PASSWORD)

    def test_the_current_password_is_required(self, api_client, staff_user):
        """Without it, a stolen access token takes the account permanently."""
        sign_in(api_client, staff_user)

        response = api_client.post(
            CHANGE, {"current_password": "wrong", "new_password": NEW_PASSWORD}, format="json"
        )

        assert response.status_code == 400
        staff_user.refresh_from_db()
        assert staff_user.check_password(PASSWORD)

    def test_it_needs_a_signed_in_caller(self, api_client, staff_user):
        response = api_client.post(
            CHANGE, {"current_password": PASSWORD, "new_password": NEW_PASSWORD}, format="json"
        )

        assert response.status_code in (401, 403)


class TestMustChangePassword:
    def test_the_login_carries_the_marker(self, api_client, staff_user):
        """The gate is useless if the frontend cannot see it."""
        state = lockout.state_for(staff_user)
        state.must_change_password = True
        state.save()

        response = sign_in(api_client, staff_user)

        assert response.data["must_change_password"] is True

    def test_an_ordinary_login_reports_false(self, api_client, staff_user):
        assert sign_in(api_client, staff_user).data["must_change_password"] is False
