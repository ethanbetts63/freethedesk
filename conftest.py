import pytest
from rest_framework.test import APIClient, APIRequestFactory, force_authenticate


@pytest.fixture
def api_client():
    """A DRF ``APIClient``, for tests that need ``force_authenticate`` rather than
    session login (pytest-django's built-in ``client`` fixture is a plain Django
    test client, which only supports session-based ``force_login``)."""
    return APIClient()


@pytest.fixture
def drf_request_factory():
    """Build an authenticated ``rest_framework.request.Request``.

    Many serializers need a request in their context to resolve the current user.
    Building one by hand for every test is repetitive, so this fixture does it once:

        def test_my_serializer(drf_request_factory):
            user = UserFactory()
            request = drf_request_factory(user=user)
            serializer = MySerializer(data={...}, context={"request": request})
            ...
    """

    def _build(user=None):
        request = APIRequestFactory().get("/")
        if user is not None:
            force_authenticate(request, user=user)
            request.user = user
        return request

    return _build
