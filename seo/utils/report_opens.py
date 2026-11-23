"""Who opened a report's link: one way of logging and one way of counting, for a prospect report and a sample's
companion report alike (owner, 2026-11-23).

Every open by anyone but the owner signed in is a row (``ReportOpen``: ``SeoProspectOpen``, ``SeoSampleOpen``), with
where the link came from and whether a person or a link preview did it. The counts take only people, and only from
the email's send on (``counted``): a look before it is the owner checking the page, or a preview.
"""

import re

from django.contrib.auth import get_user_model
from django.db.models import F, Q
from freetheplatform.auth.conf import cookie_names
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken

from ..models import ReportOpen

#: Where a link came from, as its ``?s=`` says: the report email, the follow-up, a text during a call, or the
#: dashboard's own copy. Anything else is recorded as nothing.
SOURCES = ("email", "follow-up", "text", "dashboard")

#: A user agent that is a link preview or a crawler, not a person: a text message's preview fetch (iMessage,
#: WhatsApp, Facebook Messenger), a mail client's link scanner, or a monitor. Counted apart on the dashboard.
LIKELY_BOT = re.compile(
    r"bot|crawl|spider|preview|facebookexternalhit|facebot|slack|whatsapp|telegram|discord|skype|curl|wget|"
    r"python-requests|headless|lighthouse|pingdom|uptime|monitor|validator|scan|fetch|http",
    re.IGNORECASE,
)


def signed_in_staff(request) -> bool:
    """Whether the browser is signed in to the dashboard as staff: a live access cookie, or the refresh cookie that
    outlasts it (an hour against seven days). The cookies are the site's own, so the report's link carries them."""
    for name, token_class in zip(cookie_names(), (AccessToken, RefreshToken)):
        raw = request.COOKIES.get(name)
        if not raw:
            continue
        try:
            token = token_class(raw)
            if token_class is RefreshToken:
                token.check_blacklist()
        except TokenError:
            continue
        user_id = token.get(api_settings.USER_ID_CLAIM)
        if get_user_model().objects.filter(pk=user_id, is_active=True, is_staff=True).exists():
            return True
    return False


def record_open(report, request, kind: str = ReportOpen.Kind.PAGE, source: str | None = None) -> ReportOpen | None:
    """One row per open of ``report`` (a prospect or a sample): when, of what, where the link came from, and whether
    a person or a preview did it. ``source`` unset reads the link's own ``?s=``.

    The owner's own looks are not opens: none is logged while the browser is signed in as staff (owner, 2026-11-12).
    The sign-in is the test, not the address, which a VPN changes."""
    if signed_in_staff(request):
        return None
    if source is None:
        source = request.GET.get("s", "")[:20]
        source = source if source in SOURCES else ""
    user_agent = request.META.get("HTTP_USER_AGENT", "")[:300]
    return report.opens.create(
        kind=kind,
        source=source,
        user_agent=user_agent,
        likely_bot=not user_agent or bool(LIKELY_BOT.search(user_agent)),
    )


def counted(*kinds: str) -> Q:
    """The opens of these kinds that the counts take, as a filter on a report queryset's ``opens``: by a person
    (previews and crawlers left out), and at or after the email went. A report not yet sent has none (owner,
    2026-11-14)."""
    return Q(opens__likely_bot=False, opens__opened_at__gte=F("sent_at"), opens__kind__in=kinds)
