"""Rotation, logout revocation, and the blacklist cleanup that follows them.

These tests fail if the blacklist app is dropped from ``INSTALLED_APPS`` or
``BLACKLIST_AFTER_ROTATION`` is turned back off, which is the point of writing
them: the setting is a single word with no visible effect on a passing login.
"""

from datetime import timedelta

import pytest
from django.core.cache import cache
from django.utils import timezone
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken

from core.tests.factories import UserFactory
from core.utils import token_cleanup

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


def test_expired_tokens_are_purged_and_live_ones_kept():
    """The flush clears what has expired and nothing else.

    Deleting a live token would sign somebody out, so this is the boundary that
    matters most.
    """
    user = UserFactory()
    _expired_token(user)
    RefreshToken.for_user(user)

    token_cleanup.purge_expired_tokens()

    assert OutstandingToken.objects.count() == 1
    assert not OutstandingToken.objects.filter(expires_at__lte=timezone.now()).exists()


def test_blacklist_rows_go_with_their_token():
    """The blacklist table is only reachable through the cascade."""
    user = UserFactory()
    token = RefreshToken.for_user(user)
    token.blacklist()
    row = OutstandingToken.objects.get(jti=token["jti"])
    row.expires_at = timezone.now() - timedelta(days=1)
    row.save(update_fields=["expires_at"])

    token_cleanup.purge_expired_tokens()

    assert BlacklistedToken.objects.count() == 0


def test_deletion_is_bounded_by_the_batch_size(monkeypatch):
    """One unlucky login pays for a bounded batch, not the whole table."""
    monkeypatch.setattr(token_cleanup, "CLEANUP_BATCH_SIZE", 2)
    user = UserFactory()
    for _ in range(3):
        _expired_token(user)

    token_cleanup.purge_expired_tokens()

    assert OutstandingToken.objects.count() == 1


def test_cleanup_skips_when_it_ran_recently():
    """At most once per interval, however busy the morning is."""
    user = UserFactory()
    token_cleanup.purge_expired_tokens_if_due()
    _expired_token(user)

    token_cleanup.purge_expired_tokens_if_due()

    assert OutstandingToken.objects.count() == 1


def test_a_failing_cleanup_neither_raises_nor_retries(monkeypatch):
    """A login must not fail because a housekeeping delete did, and a database
    problem must not then be paid for by every login that follows."""
    calls = []

    def boom():
        calls.append(1)
        raise RuntimeError("database is having a bad day")

    monkeypatch.setattr(token_cleanup, "purge_expired_tokens", boom)

    token_cleanup.purge_expired_tokens_if_due()
    token_cleanup.purge_expired_tokens_if_due()

    assert len(calls) == 1


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
