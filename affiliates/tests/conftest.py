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


@pytest.fixture
def internal_key(settings):
    """The upload endpoint's shared secret, set for a test."""
    settings.INTERNAL_API_KEY = "a-shared-secret-of-thirty-two-chars!"
    return settings.INTERNAL_API_KEY
