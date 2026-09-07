import pytest

from core.tests.factories import UserFactory


@pytest.fixture
def staff_user():
    return UserFactory(username="admin", is_staff=True)
