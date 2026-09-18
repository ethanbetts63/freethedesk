import pytest
from django.conf import settings as django_settings
from django.test import Client
from freetheplatform.messaging.backends import locmem, reset_backend_cache
from rest_framework.test import APIClient, APIRequestFactory, force_authenticate
from rest_framework_simplejwt.tokens import AccessToken


class SignInClient(Client):
    """A test client that authenticates the way the product does.

    Cookie-JWT is the only authentication class, so a session no longer reaches
    the API and ``force_login`` proves nothing about it. ``sign_in`` sets the
    access-token cookie instead, which is the path a real browser takes.
    """

    def sign_in(self, user):
        self.cookies[django_settings.AUTH_COOKIE] = str(AccessToken.for_user(user))
        return user


@pytest.fixture
def client():
    return SignInClient()


@pytest.fixture(autouse=True)
def outbox(settings):
    """Messages handed to a provider during a test, emptied between tests.

    Both channels are pointed at the in-memory provider, so tests exercise the
    real sending path without reaching Mailgun or Twilio and without patching
    either of them. Assert on this rather than on rows in the table: a row proves
    only that the caller ran.
    """
    # Staff addresses are env-driven and unset under test, which would make every
    # admin alert fail with "no recipient" before it reached a provider.
    settings.ADMIN_EMAIL = settings.ADMIN_EMAIL or "staff@example.com"
    settings.ADMIN_NUMBER = settings.ADMIN_NUMBER or "+61400000000"
    settings.FTP_MESSAGING = {
        **settings.FTP_MESSAGING,
        "BACKENDS": {
            "email": "freetheplatform.messaging.backends.locmem.send",
            "sms": "freetheplatform.messaging.backends.locmem.send",
        },
    }
    locmem.outbox.clear()
    reset_backend_cache()
    yield locmem.outbox
    locmem.outbox.clear()
    reset_backend_cache()


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
