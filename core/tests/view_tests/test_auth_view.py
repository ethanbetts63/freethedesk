import pytest

from core.tests.factories import UserFactory

pytestmark = pytest.mark.django_db


def test_staff_login_sets_http_only_auth_cookies(api_client):
    UserFactory(username="admin", password="test-password-123", is_staff=True)

    response = api_client.post(
        "/api/token/",
        {"username": "admin", "password": "test-password-123"},
        format="json",
    )
    assert response.status_code == 200
    assert response.cookies["freethedesk_access"]["httponly"]
    assert response.cookies["freethedesk_refresh"]["httponly"]
