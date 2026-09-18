"""Rotation, logout revocation, and that a login still triggers the blacklist flush.

The flush itself is the shared package's, and is tested there. What is worth
asserting here is that this product still calls it, since a cleanup nothing
invokes is the same as no cleanup.

These tests fail if the blacklist app is dropped from ``INSTALLED_APPS`` or
``BLACKLIST_AFTER_ROTATION`` is turned back off, which is the point of writing
them: the setting is a single word with no visible effect on a passing login.
"""

from datetime import timedelta

import pytest
from django.core.cache import cache
from django.utils import timezone
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken

from core.tests.factories import UserFactory

pytestmark = pytest.mark.django_db


@pytest.fixture(autouse=True)
def clear_local_memory_cache():
    """Reset the process cache around each test.

    Two things live in it that outlast a test: the cleanup's "ran recently"
    marker, and DRF's throttle history for the login endpoint. Neither is reset
    by the database rollback, so without this a test inherits whatever the
    previous one left behind.
    """
    cache.clear()
    yield
    cache.clear()


def _expired_token(user):
    """An outstanding token whose expiry has passed."""
    token = RefreshToken.for_user(user)
    row = OutstandingToken.objects.get(jti=token["jti"])
    row.expires_at = timezone.now() - timedelta(days=1)
    row.save(update_fields=["expires_at"])
    return row


def test_rotated_refresh_token_is_rejected_on_reuse(api_client):
    """A refresh token already exchanged once cannot be exchanged again."""
    user = UserFactory(is_staff=True)
    refresh = RefreshToken.for_user(user)

    api_client.cookies["freethedesk_refresh"] = str(refresh)
    assert api_client.post("/api/token/refresh/", format="json").status_code == 200

    api_client.cookies["freethedesk_refresh"] = str(refresh)
    assert api_client.post("/api/token/refresh/", format="json").status_code == 401


def test_refresh_issues_a_different_refresh_token(api_client):
    """Guards the assumption the reuse test depends on: rotation still happens."""
    user = UserFactory(is_staff=True)
    refresh = RefreshToken.for_user(user)
    api_client.cookies["freethedesk_refresh"] = str(refresh)

    response = api_client.post("/api/token/refresh/", format="json")

    assert response.cookies["freethedesk_refresh"].value != str(refresh)


def test_logout_blacklists_the_refresh_token(api_client):
    """Logout ends the session, not merely the client's view of it."""
    user = UserFactory(is_staff=True)
    refresh = RefreshToken.for_user(user)

    api_client.cookies["freethedesk_refresh"] = str(refresh)
    assert api_client.post("/api/token/logout/", format="json").status_code == 200

    api_client.cookies["freethedesk_refresh"] = str(refresh)
    assert api_client.post("/api/token/refresh/", format="json").status_code == 401


def test_logout_succeeds_when_the_refresh_token_is_unusable(api_client):
    """Logout must never fail — refusing it leaves the session open."""
    api_client.cookies["freethedesk_refresh"] = "not.a.real.token"

    response = api_client.post("/api/token/logout/", format="json")

    assert response.status_code == 200
    assert response.cookies["freethedesk_refresh"].value == ""


def test_logout_twice_succeeds(api_client):
    """A second logout with an already-blacklisted token is not an error."""
    user = UserFactory(is_staff=True)
    refresh = RefreshToken.for_user(user)

    api_client.cookies["freethedesk_refresh"] = str(refresh)
    assert api_client.post("/api/token/logout/", format="json").status_code == 200

    api_client.cookies["freethedesk_refresh"] = str(refresh)
    assert api_client.post("/api/token/logout/", format="json").status_code == 200


def test_successful_login_purges_expired_tokens(api_client):
    """The flush is only useful if something actually calls it."""
    user = UserFactory(username="admin", password="test-password-123", is_staff=True)
    _expired_token(user)

    response = api_client.post(
        "/api/token/",
        {"username": "admin", "password": "test-password-123"},
        format="json",
    )

    assert response.status_code == 200
    # The login issued a token of its own, so what must be gone is the expired
    # one, not every row.
    assert not OutstandingToken.objects.filter(expires_at__lte=timezone.now()).exists()
