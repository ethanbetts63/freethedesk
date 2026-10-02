"""The access checks against Google's answers, with Google replaced at the HTTP boundary."""

import pytest
from freetheplatform.searchconsole.auth import ServiceAccountCredentials
from freetheplatform.searchconsole.client import SearchConsoleClient

from seo.utils import google_access
from seo.utils.google_access import AccessCheckUnavailable


@pytest.fixture
def credentials(settings, monkeypatch):
    settings.SEO_GOOGLE_CREDENTIALS = "key.json"
    monkeypatch.setattr(
        ServiceAccountCredentials,
        "load",
        classmethod(lambda cls, path: cls(client_email="sa@x", private_key="k", token_uri="t")),
    )
    monkeypatch.setattr(ServiceAccountCredentials, "access_token", lambda self: "token")


@pytest.fixture
def sites(monkeypatch, credentials):
    listed = []
    monkeypatch.setattr(SearchConsoleClient, "list_sites", lambda self: listed)
    return listed


def test_no_key_configured_means_the_check_cannot_run(settings):
    settings.SEO_GOOGLE_CREDENTIALS = ""
    with pytest.raises(AccessCheckUnavailable):
        google_access.find_search_console_property("https://example.com")


def test_finds_the_property_for_the_customers_site(sites):
    sites += [
        {"siteUrl": "sc-domain:other.example", "permissionLevel": "siteRestrictedUser"},
        {"siteUrl": "sc-domain:example.com", "permissionLevel": "siteRestrictedUser"},
    ]
    assert google_access.find_search_console_property("https://www.example.com/") == "sc-domain:example.com"


def test_an_unverified_user_is_not_access(sites):
    sites.append({"siteUrl": "sc-domain:example.com", "permissionLevel": "siteUnverifiedUser"})
    assert google_access.find_search_console_property("https://example.com") == ""


def test_no_website_matches_nothing(sites):
    # Without a host to match, the property chooser would match every site.
    sites.append({"siteUrl": "sc-domain:example.com", "permissionLevel": "siteOwner"})
    assert google_access.find_search_console_property("") == ""


class _Response:
    def __init__(self, payload, status=200):
        self._payload, self.status_code, self.text = payload, status, ""
        self.ok = status < 400

    def json(self):
        return self._payload


def test_finds_the_analytics_property_by_its_web_stream(monkeypatch, credentials):
    pages = {
        f"{google_access.ANALYTICS_ADMIN_API}/accountSummaries": [
            {"accountSummaries": [{"propertySummaries": [{"property": "properties/1"}]}],
             "nextPageToken": "p2"},
            {"accountSummaries": [
                {"propertySummaries": [{"property": "properties/2", "displayName": "Example"}]}
            ]},
        ],
        f"{google_access.ANALYTICS_ADMIN_API}/properties/1/dataStreams": [
            {"dataStreams": [{"webStreamData": {"defaultUri": "https://other.example"}}]},
        ],
        f"{google_access.ANALYTICS_ADMIN_API}/properties/2/dataStreams": [
            {"dataStreams": [{"webStreamData": {"defaultUri": "https://www.example.com"}}]},
        ],
    }

    def get(url, params, headers, timeout):
        assert headers["Authorization"] == "Bearer token"
        return _Response(pages[url].pop(0))

    monkeypatch.setattr(google_access.requests, "get", get)
    assert google_access.find_analytics_property("https://example.com") == "Example (properties/2)"


def test_an_analytics_refusal_means_the_check_cannot_run(monkeypatch, credentials):
    monkeypatch.setattr(
        google_access.requests, "get", lambda *a, **k: _Response({}, status=403)
    )
    with pytest.raises(AccessCheckUnavailable):
        google_access.find_analytics_property("https://example.com")
