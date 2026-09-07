import pytest

from core.tests.factories import UserFactory
from dealers.tests.factories import DealerFactory


@pytest.fixture
def dealer():
    user = UserFactory(username="d@example.com")
    return DealerFactory(
        user=user, business_name="Bikes WA", contact_name="Sam Lee", phone="0400 111 222",
    )


@pytest.fixture
def staff_user():
    return UserFactory(username="staff", email="staff@freethedesk.com.au", is_staff=True)
