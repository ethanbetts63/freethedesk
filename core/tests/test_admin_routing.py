"""Django's admin must not be routed when DEBUG is off.

The admin login is not a DRF view, so no throttle class applies to it. Left
routed in production it accepts unlimited password attempts against ``is_staff``
accounts, which reach every dealer, SEO subscriber and enquiry through the ORM.
Removing the route is the whole control, so the test that matters is the one
that fails if the route comes back.

The URLconf reads ``settings.DEBUG`` at import time, so ``override_settings``
alone changes nothing — the module has to be reloaded under each value.
"""

import importlib

import pytest
from django.urls import Resolver404, clear_url_caches, resolve

import config.urls


@pytest.fixture
def urlconf_under_debug():
    """Reload the root URLconf with a given DEBUG, then put it back."""

    def _load(debug, settings):
        settings.DEBUG = debug
        clear_url_caches()
        importlib.reload(config.urls)
        return config.urls

    yield _load

    clear_url_caches()
    importlib.reload(config.urls)


def test_admin_is_not_routed_in_production(urlconf_under_debug, settings):
    urlconf = urlconf_under_debug(False, settings)

    with pytest.raises(Resolver404):
        resolve("/admin/", urlconf=urlconf)


def test_admin_is_routed_locally(urlconf_under_debug, settings):
    urlconf = urlconf_under_debug(True, settings)

    assert resolve("/admin/", urlconf=urlconf) is not None


def test_the_api_is_routed_either_way(urlconf_under_debug, settings):
    """The DEBUG branch must not swallow the routes that follow it."""
    for debug in (True, False):
        urlconf = urlconf_under_debug(debug, settings)

        assert resolve("/api/token/", urlconf=urlconf) is not None
