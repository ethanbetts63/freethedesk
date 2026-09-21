# --- One test run per repository at a time ---------------------------------
#
# Django derives the test database name from DATABASES["default"]["NAME"], so
# every pytest process in this repository uses the same one. Several agents work
# these repositories at once, and a second run's DROP/CREATE pulls the tables out
# from under the first -- which surfaces as hundreds of "table doesn't exist"
# errors that read exactly like a code regression rather than a collision.
#
# The lock is taken when this file is imported, the earliest point available, and
# is held by the operating system rather than by a file we write. That matters:
# a cancelled or crashed run releases it automatically, so it can never strand
# the next one.
#
# Keyed per repository, so two runs here wait for each other while a run in a
# sibling product does not. The key also covers anything else a run shares --
# the media directory written during a run.

import atexit
import sys as _sys
import tempfile as _tempfile
import time as _time
from pathlib import Path as _Path

_TEST_RUN_KEY = "freethedesk"
_TEST_RUN_WAIT = 0.0


def _notify(message):
    """Write to the real terminal, bypassing pytest's capture."""
    device = "CON" if _sys.platform == "win32" else "/dev/tty"
    try:
        with open(device, "w") as terminal:
            terminal.write(f"\n{message}\n")
    except OSError:
        # No terminal -- CI, or output redirected to a file.
        print(message, file=_sys.__stderr__, flush=True)


def _acquire_test_run_lock(key):
    path = _Path(_tempfile.gettempdir()) / f"ftp-pytest-{key}.lock"
    handle = open(path, "a+")

    def taken():
        try:
            if _sys.platform == "win32":
                import msvcrt

                handle.seek(0)
                msvcrt.locking(handle.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl

                fcntl.flock(handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError:
            return False
        return True

    waited_from = _time.time()
    announced = False
    while not taken():
        if not announced:
            # Straight to the terminal, not to stdout: pytest installs its
            # capture before it imports this file, so a plain print here is
            # swallowed and a waiting run just looks hung.
            _notify(f"Another test run holds {path.name}. Waiting for it to finish.")
            announced = True
        _time.sleep(5)

    global _TEST_RUN_WAIT
    _TEST_RUN_WAIT = _time.time() - waited_from

    # Held for the life of the process; the OS releases it on exit.
    atexit.register(handle.close)
    return handle


_TEST_RUN_LOCK = _acquire_test_run_lock(_TEST_RUN_KEY)


def pytest_report_header(config):
    """Say so in the run header when this run queued behind another.

    The notice printed while waiting goes to the terminal, which a human
    sees and a piped caller does not. This is the half that survives a pipe.
    """
    if _TEST_RUN_WAIT >= 1:
        return f"test-run lock: waited {_TEST_RUN_WAIT:.0f}s for another run in this repository"
    return None


import pytest
from django.core.cache import caches
from django.test import Client
from freetheplatform.auth.conf import cookie_names
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
        access_cookie, _ = cookie_names()
        self.cookies[access_cookie] = str(AccessToken.for_user(user))
        return user


@pytest.fixture
def client():
    return SignInClient()


@pytest.fixture(autouse=True)
def empty_caches():
    """No test inherits another's throttle history.

    Throttle counters live in the `throttling` cache and the blacklist-cleanup
    marker lives in the default one. Neither is touched by the database
    rollback, so without this a test that signs in fails because eleven earlier
    ones already used up the login rate — and it fails only in a full run, which
    is the worst way to find out.
    """
    for cache in caches.all(initialized_only=False):
        cache.clear()
    yield
    for cache in caches.all(initialized_only=False):
        cache.clear()


@pytest.fixture(autouse=True)
def outbox(settings):
    """Messages handed to a provider during a test, emptied between tests.

    Both channels are pointed at the in-memory provider, so tests exercise the
    real sending path without reaching Mailgun or Twilio and without patching
    either of them. Assert on this rather than on rows in the table: a row proves
    only that the caller ran.
    """
    # Env-driven and unset under test, which would fail every alert with "no recipient".
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


@pytest.fixture
def selling_dealer():
    """A dealership cleared to trade.

    Defined here rather than in one app's own conftest because three apps now
    act on a sale — `sales`, `documents`, and shortly `identity` — and a fixture
    copied into each is three definitions that can disagree about what "able to
    sell" means.

    Cleared to trade matters: the sales views require an approved account on a
    paying subscription, so a factory-default dealer is refused before any of
    the behaviour under test is reached.
    """
    from core.tests.factories import UserFactory
    from dealers.models import Dealer
    from dealers.tests.factories import DealerFactory

    return DealerFactory(
        user=UserFactory(username="sam@bikeswa.example"),
        business_name="Bikes WA",
        contact_name="Sam Lee",
        status=Dealer.Status.ACTIVE,
        payment_status=Dealer.PaymentStatus.ACTIVE,
    )


@pytest.fixture
def rival_dealer():
    """A second dealership, for the cross-tenant tests.

    Named for what it is for. Every list and detail endpoint gets a test that
    this one cannot see the other's sales, and a fixture called `dealer_two`
    would not say why it exists.
    """
    from core.tests.factories import UserFactory
    from dealers.models import Dealer
    from dealers.tests.factories import DealerFactory

    return DealerFactory(
        user=UserFactory(username="kim@otherbikes.example"),
        business_name="Other Bikes",
        contact_name="Kim Ng",
        status=Dealer.Status.ACTIVE,
        payment_status=Dealer.PaymentStatus.ACTIVE,
    )


@pytest.fixture(scope="session", autouse=True)
def _complete_test_schema(django_db_setup, django_db_blocker):
    """Refuse to run against a half-built test database.

    A run that was cancelled partway through creation leaves one behind, and the
    next run inherits it: single tests pass because they touch the few tables
    that exist, while the suite fails in hundreds of places. This turns that into
    one sentence naming the cause.
    """
    from django.apps import apps
    from django.db import connection

    with django_db_blocker.unblock():
        existing = set(connection.introspection.table_names())

    missing = sorted(
        model._meta.db_table
        for model in apps.get_models()
        if model._meta.managed and model._meta.db_table not in existing
    )
    if missing:
        pytest.exit(
            f"The test database is missing {len(missing)} table(s), starting with "
            f"{missing[0]}. It was most likely left half-built by a cancelled or "
            "concurrent run. Re-run with --create-db.",
            returncode=1,
        )
