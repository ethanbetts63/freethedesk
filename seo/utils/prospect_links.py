"""The report's own address on the site: ``freethedesk.com.au/r/<token>``, the report as a phone shows it.

The owner texts it by hand during a call (the brief prints it with ``?s=text``),
and every report email carries it beside the PDF (owner, 2026-11-04). The token is unguessable and the page is noindexed and
linked from nowhere. Each open is logged against the prospect with where the
link came from, so the dashboard shows who looked: the first engagement signal
the outreach has. See ``_docs/seo-prospect-outreach.md``.
"""

import re
from html import escape

from core.utils.urls import site_url

from ..models import SeoProspect, SeoProspectOpen

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


def report_link(prospect: SeoProspect, source: str = "") -> str:
    """The page's address, with ``?s=<source>`` when the link is placed somewhere the opens should name."""
    base = f"{site_url()}/r/{prospect.link_token}"
    return f"{base}?s={source}" if source else base


def pdf_link(prospect: SeoProspect) -> str:
    return f"{site_url()}/r/{prospect.link_token}/pdf"


def record_open(prospect: SeoProspect, request, kind: str = SeoProspectOpen.Kind.PAGE) -> SeoProspectOpen:
    """One row per open: when, which file, where the link came from, and whether a person or a preview did it."""
    source = request.GET.get("s", "")[:20]
    user_agent = request.META.get("HTTP_USER_AGENT", "")[:300]
    return SeoProspectOpen.objects.create(
        prospect=prospect,
        kind=kind,
        source=source if source in SOURCES else "",
        user_agent=user_agent,
        likely_bot=not user_agent or bool(LIKELY_BOT.search(user_agent)),
    )


# -- the page --------------------------------------------------------------

ROBOTS = '<meta name="robots" content="noindex, nofollow, noarchive">'

# The strip over the report and the ask under it: the only parts of the page that are the site's rather than the
# report's. Inline, prefixed, and small, so the report's own stylesheet is left alone.
_STYLE = """<style>
.ftd-bar{position:sticky;top:0;z-index:9;padding:8px 16px 9px;background:#09121b;color:#fff;font:500 12.5px/1.4 Archivo,"Helvetica Neue",Arial,sans-serif}
.ftd-bar__who{display:block;opacity:.8}
.ftd-bar__row{display:flex;flex-wrap:wrap;align-items:center;gap:4px 16px;margin-top:3px}
.ftd-bar a{display:inline-flex;align-items:center;gap:5px;color:#fff;text-decoration:none;font-weight:600;white-space:nowrap}
.ftd-bar svg{width:13px;height:13px;flex:none;fill:currentColor}
.ftd-bar a.ftd-bar__pdf{margin-left:auto;opacity:.8;text-decoration:underline}
.ftd-ask{max-width:744px;margin:0 auto;padding:0 24px 56px;font-family:Archivo,"Helvetica Neue",Arial,sans-serif}
.ftd-ask__card{padding:22px 24px;border:1px solid #d3dbe4;border-radius:8px;background:#f6f7f9}
.ftd-ask h2{margin:0 0 8px;font-size:1.25rem;line-height:1.2;letter-spacing:-.02em;color:#09121b}
.ftd-ask p{margin:0 0 14px;font-size:.95rem;line-height:1.5;color:#405164}
.ftd-ask a{display:inline-block;padding:9px 16px;border-radius:999px;background:#2473c6;color:#fff;font-weight:700;font-size:.9rem;text-decoration:none}
@media (max-width:640px){.ftd-ask{padding:0 18px 40px}.ftd-ask__card{padding:18px 16px}}
</style>"""

_PHONE_ICON = (
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25'
    " 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4"
    ' 0 0 0 .6 3.6 1 1 0 0 1-.25 1z"/></svg>'
)
_MAIL_ICON = (
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1'
    " 1 0 0 1 1-1zm1 2.6V18h16V7.6l-8 5.4zm.9-.6L12 11.6 19.1 7z\"/></svg>"
)

# The strip: whom it was written for, then the number, the address and the PDF, each a tap (owner, 2026-11-04).
_BAR = (
    '<div class="ftd-bar"><span class="ftd-bar__who">Written for {business} by freethedesk</span>'
    '<span class="ftd-bar__row">'
    f'<a href="tel:+61423853830">{_PHONE_ICON}0423 853 830</a>'
    f'<a href="mailto:analytics@freethedesk.com.au">{_MAIL_ICON}analytics@freethedesk.com.au</a>'
    '<a class="ftd-bar__pdf" href="{pdf}">PDF</a></span></div>'
)

_ASK = (
    '<div class="ftd-ask"><div class="ftd-ask__card"><h2>The full report, written from your own data</h2>'
    "<p>This one was written from what anyone can see. The full report works from your Search Console and "
    "analytics, makes better-informed recommendations, and tracks whether each one worked.</p>"
    '<a href="https://www.freethedesk.com.au/seo">See what it covers</a></div></div>'
)


def page_document(prospect: SeoProspect, document: str) -> str:
    """The report's HTML with the robots meta in its head, the site's strip over it and the ask under it."""
    document = document.replace("<head>", f"<head>\n{ROBOTS}\n{_STYLE}", 1)
    document = document.replace(
        "<body>", "<body>\n" + _BAR.format(business=escape(prospect.business), pdf=escape(pdf_link(prospect))), 1
    )
    foot = document.rfind("</body>")
    return document[:foot] + _ASK + "\n" + document[foot:] if foot >= 0 else document + _ASK


def page_headers(response):
    """A page for one reader: never indexed, never cached by anything between, never a referrer."""
    response["X-Robots-Tag"] = "noindex, nofollow, noarchive"
    response["Cache-Control"] = "private, no-store"
    response["Referrer-Policy"] = "no-referrer"
    return response
