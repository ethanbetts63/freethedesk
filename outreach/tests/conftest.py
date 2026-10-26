import pytest

from core.tests.factories import UserFactory


@pytest.fixture
def staff_user():
    return UserFactory(username="staff", email="staff@freethedesk.com.au", is_staff=True)


@pytest.fixture
def internal_key(settings):
    settings.INTERNAL_API_KEY = "a-shared-secret-of-thirty-two-chars!"
    return settings.INTERNAL_API_KEY
