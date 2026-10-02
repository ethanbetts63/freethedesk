"""Whether our service account can actually read a customer's Google data.

Customers add the service account to Search Console and Analytics themselves,
and the usual mistake is the wrong property, the wrong role or a typo in the
address. Asking Google which properties the account can see is the only way to
know the access works, so a setup step is confirmed from here, never from the
customer's say-so.

Every failure that is not "we looked and it isn't there" raises
``AccessCheckUnavailable``: no key configured, Google refusing the key, the API
being down. The caller tells the customer we couldn't check and leaves the
step for staff to confirm, rather than telling them they got it wrong.
"""

from urllib.parse import urlsplit

import requests
from django.conf import settings
from freetheplatform.searchconsole.auth import (
    READONLY_SCOPE,
    CredentialsError,
    ServiceAccountCredentials,
)
from freetheplatform.searchconsole.client import SearchConsoleClient, SearchConsoleError
from freetheplatform.searchconsole.onboard import choose_property


ANALYTICS_SCOPE = "https://www.googleapis.com/auth/analytics.readonly"
ANALYTICS_ADMIN_API = "https://analyticsadmin.googleapis.com/v1beta"

# A user Google lists but has not verified holds no access to the data.
_NO_ACCESS = "siteUnverifiedUser"


class AccessCheckUnavailable(Exception):
    """The check could not run, so it says nothing about the customer's setup."""


def _host(url: str) -> str:
    host = urlsplit(url if "//" in url else f"https://{url}").hostname or ""
    return host.lower().removeprefix("www.")


def _credentials(scope: str) -> ServiceAccountCredentials:
    path = settings.SEO_GOOGLE_CREDENTIALS
    if not path:
        raise AccessCheckUnavailable("No Google service-account key is configured.")
    try:
        credentials = ServiceAccountCredentials.load(path)
    except CredentialsError as error:
        raise AccessCheckUnavailable(str(error)) from error
    credentials.scope = scope
    return credentials


def find_search_console_property(website: str) -> str:
    """The Search Console property covering ``website`` we can read, or ``""``."""
    if not _host(website):
        return ""
    credentials = _credentials(READONLY_SCOPE)
    try:
        sites = SearchConsoleClient(credentials=credentials, property="").list_sites()
    except (CredentialsError, SearchConsoleError) as error:
        raise AccessCheckUnavailable(str(error)) from error
    readable = [site for site in sites if site.get("permissionLevel") != _NO_ACCESS]
    found, _ = choose_property(readable, slug="", site_url=website)
    return found


def _paged(url: str, key: str, token: str):
    page_token = ""
    while True:
        params = {"pageSize": 200, **({"pageToken": page_token} if page_token else {})}
        try:
            response = requests.get(
                url, params=params, headers={"Authorization": f"Bearer {token}"}, timeout=30
            )
        except requests.RequestException as error:
            raise AccessCheckUnavailable(f"Google Analytics could not be reached: {error}") from error
        if not response.ok:
            raise AccessCheckUnavailable(
                f"Google Analytics refused {url}: {response.status_code} {response.text[:300]}"
            )
        payload = response.json()
        yield from payload.get(key, [])
        page_token = payload.get("nextPageToken", "")
        if not page_token:
            return


def find_analytics_property(website: str) -> str:
    """The GA4 property with a web stream for ``website`` we can read, or ``""``.

    Properties carry no URL of their own, so the match is on each web data
    stream's default URI.
    """
    wanted = _host(website)
    if not wanted:
        return ""
    try:
        token = _credentials(ANALYTICS_SCOPE).access_token()
    except CredentialsError as error:
        raise AccessCheckUnavailable(str(error)) from error
    for account in _paged(f"{ANALYTICS_ADMIN_API}/accountSummaries", "accountSummaries", token):
        for summary in account.get("propertySummaries", []):
            name = summary.get("property", "")
            streams = _paged(f"{ANALYTICS_ADMIN_API}/{name}/dataStreams", "dataStreams", token)
            for stream in streams:
                uri = stream.get("webStreamData", {}).get("defaultUri", "")
                if uri and _host(uri) == wanted:
                    label = summary.get("displayName", "")
                    return f"{label} ({name})" if label else name
    return ""
