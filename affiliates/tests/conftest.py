import pytest
from django.core.cache import cache

from affiliates.tests.factories import AffiliateFactory
from core.tests.factories import UserFactory


@pytest.fixture(autouse=True)
def _clear_throttle_cache():
    cache.clear()


@pytest.fixture
def affiliate():
    return AffiliateFactory(user__username="sam@thetradieshow.com.au")


@pytest.fixture
def staff_user():
    return UserFactory(username="staff", email="staff@freethedesk.com.au", is_staff=True)
