"""The report's own address on the site: ``freethedesk.com.au/reports/<business>-<token>``, the report as a
phone shows it.

The owner texts it by hand during a call (the brief prints it with ``?s=text``),
and every report email carries it (owner, 2026-11-04); it is the report's only copy since the PDF went (owner,
2026-11-12). The business's name leads the address so it
reads as the business's own page; the token after it is the key, unguessable, and the page is noindexed and
linked from nowhere (owner, 2026-11-06). A link with the token alone, or under another name (the first links went
out as ``/r/<token>``), is sent on to the named address; the site sends any ``/r/`` link on to ``/reports/``
(owner, 2026-11-07). Each open is logged against the prospect with where the
link came from, so the dashboard shows who looked: the first engagement signal
the outreach has. See ``_docs/seo-prospect-outreach.md``.
"""

import re
from datetime import date
from html import escape

from django.contrib.auth import get_user_model
from django.utils.text import slugify
from freetheplatform.auth.conf import cookie_names
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken

from core.utils.urls import site_url

from ..models import SeoProspect, SeoProspectOpen

#: Where a link came from, as its ``?s=`` says: the report email, the follow-up, a text during a call, or the
#: dashboard's own copy. Anything else is recorded as nothing.
SOURCES = ("email", "follow-up", "text", "dashboard")

#: Where on the page a click on to the SEO page was: the strip over the report, the report's own links (the ask
#: card and the locked cards' "Purchase here"), or the ask band under it.
CLICK_PLACES = ("bar", "report", "ask")

#: Every link to the SEO page in a report as uploaded, however it was spelt.
SEO_PAGE = re.compile(r'href="https?://(?:www\.)?freethedesk\.com\.au/seo/?(?:[?#][^"]*)?"')

#: A user agent that is a link preview or a crawler, not a person: a text message's preview fetch (iMessage,
#: WhatsApp, Facebook Messenger), a mail client's link scanner, or a monitor. Counted apart on the dashboard.
LIKELY_BOT = re.compile(
    r"bot|crawl|spider|preview|facebookexternalhit|facebot|slack|whatsapp|telegram|discord|skype|curl|wget|"
    r"python-requests|headless|lighthouse|pingdom|uptime|monitor|validator|scan|fetch|http",
    re.IGNORECASE,
)


#: The most of the business's name the address carries, so a long trading name does not swallow the token.
NAME_LENGTH = 60


def link_key(prospect: SeoProspect) -> str:
    """The path segment: the business's name as a slug, then the token (``bedford-chiropractic-clinic-xufxp7pjfd``).
    A name that slugifies to nothing leaves the token alone."""
    name = slugify(prospect.business)[:NAME_LENGTH].strip("-")
    return f"{name}-{prospect.link_token}" if name else prospect.link_token


def token_of(key: str) -> str:
    """The token out of a link's path segment: what follows the last hyphen (the token's alphabet has none), or
    the whole segment for a link from before the name was added."""
    return key.rsplit("-", 1)[-1]


def report_link(prospect: SeoProspect, source: str = "") -> str:
    """The page's address, with ``?s=<source>`` when the link is placed somewhere the opens should name."""
    base = f"{site_url()}/reports/{link_key(prospect)}"
    return f"{base}?s={source}" if source else base


def seo_link(prospect: SeoProspect, place: str) -> str:
    """The SEO page's address as the report page links it: through ``/reports/<key>/seo``, which logs the click
    against the prospect and sends the reader on (``SeoReportSeoView``)."""
    return f"{site_url()}/reports/{link_key(prospect)}/seo?from={place}"


def seo_destination(prospect: SeoProspect, place: str) -> str:
    """Where a click lands: the SEO page, tagged so Google Analytics names the campaign, the prospect and the place.
    The report page sends no referrer, so without the tags the visit reads as typed in."""
    return (f"{site_url()}/seo?utm_source=prospect-report&utm_medium=report"
            f"&utm_campaign={prospect.slug}&utm_content={place}")


def cover_link(prospect: SeoProspect) -> str:
    """The link's preview picture, where the site serves it (``SeoReportCoverView``)."""
    return f"{site_url()}/reports/{link_key(prospect)}/cover.jpg"


#: The preview picture for a row with no cover of its own: the SEO page's picture of what an audit reads, the one
#: the ask under the report shows, cut to the 1200 by 630 the apps expect (owner, 2026-11-07).
PREVIEW_FALLBACK = "/og-images/seo-report.jpg"
PREVIEW_WIDTH, PREVIEW_HEIGHT = 1200, 630


def preview_image(prospect: SeoProspect) -> str:
    return cover_link(prospect) if prospect.report_cover else f"{site_url()}{PREVIEW_FALLBACK}"


def preview_tags(prospect: SeoProspect) -> str:
    """What a chat or text app shows beside the link: Open Graph and Twitter tags for the title, a line, the
    picture and the address. Without them the apps show nothing, since the page is noindexed and has no other
    picture to pick (owner, 2026-11-07). The title and the line are the server's, so every report reads the same."""
    title = escape(f"{prospect.business}: SEO report")
    line = escape(f"What to change first for {prospect.business} to be found on Google, ranked by impact, and "
                  "why. A report by freethedesk.")
    image = escape(preview_image(prospect))
    url = escape(report_link(prospect))
    return "\n".join((
        f'<meta property="og:title" content="{title}">',
        f'<meta property="og:description" content="{line}">',
        f'<meta property="og:image" content="{image}">',
        f'<meta property="og:image:width" content="{PREVIEW_WIDTH}">',
        f'<meta property="og:image:height" content="{PREVIEW_HEIGHT}">',
        f'<meta property="og:url" content="{url}">',
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="freethedesk">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{title}">',
        f'<meta name="twitter:description" content="{line}">',
        f'<meta name="twitter:image" content="{image}">',
    ))


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


def record_open(prospect: SeoProspect, request, kind: str = SeoProspectOpen.Kind.PAGE,
                source: str | None = None) -> SeoProspectOpen | None:
    """One row per open: when, which file, where the link came from, and whether a person or a preview did it.

    The owner's own looks are not opens: none is logged while the browser is signed in as staff (owner, 2026-11-12).
    The sign-in is the test, not the address, which a VPN changes."""
    if signed_in_staff(request):
        return None
    if source is None:
        source = request.GET.get("s", "")[:20]
        source = source if source in SOURCES else ""
    user_agent = request.META.get("HTTP_USER_AGENT", "")[:300]
    return SeoProspectOpen.objects.create(
        prospect=prospect,
        kind=kind,
        source=source,
        user_agent=user_agent,
        likely_bot=not user_agent or bool(LIKELY_BOT.search(user_agent)),
    )


# -- the page --------------------------------------------------------------

ROBOTS = '<meta name="robots" content="noindex, nofollow, noarchive">'

# The strip over the report, the ask under it and the site's footer: the only parts of the page that are the site's
# rather than the report's. Inline, prefixed, and small, so the report's own stylesheet is left alone. The ask is a
# band the page's width between the report and the footer; the footer is the site's own, in plain CSS (Footer.tsx
# and SiteFooter.tsx are its source), without the canvas.
_STYLE = """<style>
.ftd-bar{position:sticky;top:0;z-index:9;display:flex;flex-wrap:wrap;align-items:center;gap:6px 16px;padding:8px 16px;background:#09121b;color:#fff;font:500 12.5px/1.4 Archivo,"Helvetica Neue",Arial,sans-serif}
.ftd-bar a{display:inline-flex;align-items:center;gap:5px;color:#fff;text-decoration:none;font-weight:600;white-space:nowrap}
.ftd-bar svg{width:13px;height:13px;flex:none;fill:currentColor}
.ftd-bar a.ftd-bar__cta{margin-left:auto;padding:5px 12px;border-radius:999px;background:#2473c6;font-weight:700}
.ftd-bar a.ftd-bar__cta:hover{background:#1a5fa8}
.ftd-ask{background:#f1f7fc;font-family:Archivo,"Helvetica Neue",Arial,sans-serif}
.ftd-ask__shell{display:grid;gap:28px;align-items:center;max-width:1240px;margin:0 auto;padding:44px 24px}
.ftd-ask__eyebrow{display:block;margin:0 0 10px;font-size:.68rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#1a5fa8}
.ftd-ask h2{margin:0 0 12px;font-size:1.65rem;line-height:1.15;letter-spacing:-.02em;color:#09121b}
.ftd-ask p{max-width:520px;margin:0 0 22px;font-size:1rem;line-height:1.55;color:#405164}
.ftd-ask a{display:inline-block;padding:11px 20px;border-radius:999px;background:#2473c6;color:#fff;font-weight:700;font-size:.95rem;text-decoration:none}
.ftd-ask a:hover{background:#1a5fa8}
.ftd-ask img{display:block;width:100%;max-width:560px;height:auto;margin:0 auto;border:1px solid #d3dbe4;border-radius:8px}
@media (min-width:768px){.ftd-ask__shell{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:40px;padding:56px 24px}.ftd-ask h2{font-size:2rem}}
.ftd-foot{position:relative;padding:64px 0 24px;background:#fff;color:#09121b;font-family:Archivo,"Helvetica Neue",Arial,sans-serif;background-image:linear-gradient(to top,#fff 0%,transparent 20%),linear-gradient(to right,#fff 0%,transparent 14%),linear-gradient(to left,#fff 0%,transparent 14%),linear-gradient(rgba(17,70,126,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(17,70,126,.035) 1px,transparent 1px);background-size:100% 100%,100% 100%,100% 100%,64px 64px,64px 64px;background-repeat:no-repeat,no-repeat,no-repeat,repeat,repeat}
.ftd-foot__shell{max-width:1240px;margin:0 auto;padding:0 24px}
.ftd-foot__grid{display:grid;grid-template-columns:minmax(0,1fr);gap:40px}
.ftd-foot__mark{font:900 1.35rem/1 Arial,Helvetica,sans-serif;letter-spacing:-.085em;color:#09121b;text-decoration:none}
.ftd-foot__the{color:#1a5fa8}.ftd-foot__dot{color:#2473c6}
.ftd-foot__brand p{max-width:360px;margin:20px 0 0;font-size:.95rem;line-height:1.6;color:#405164}
.ftd-foot__col{display:flex;flex-direction:column;font-size:.88rem;line-height:1.5}
.ftd-foot__col a,.ftd-foot__col>span{display:flex;align-items:center;min-height:44px;color:#405164;text-decoration:none;overflow-wrap:anywhere}
.ftd-foot__col a:hover{color:#2473c6}
.ftd-foot__eyebrow{display:block;margin:0 0 6px;font-size:.68rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#718498}
.ftd-foot__eyebrow--later{margin-top:20px}
.ftd-foot__hours{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;margin:0;color:#405164}
.ftd-foot__hours dt{font-weight:600;color:#405164}.ftd-foot__hours dd{margin:0;white-space:nowrap}
.ftd-foot__legal{display:flex;flex-direction:column;align-items:flex-start;gap:6px;margin-top:48px;padding-top:20px;border-top:1px solid #d3dbe4;font-size:.78rem;color:#718498}
@media (min-width:640px){.ftd-foot__grid{grid-template-columns:1fr 1fr}.ftd-foot__brand{grid-column:1/-1}}
@media (min-width:1024px){.ftd-foot__grid{grid-template-columns:minmax(0,1.4fr) repeat(3,minmax(0,1fr))}.ftd-foot__brand{grid-column:auto}.ftd-foot__col{gap:10px}.ftd-foot__col a,.ftd-foot__col>span{display:inline;min-height:0}.ftd-foot__legal{flex-direction:row;justify-content:space-between;align-items:center;gap:0}}
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

# The strip: the number, the address and a button to the SEO page, each a tap (owner, 2026-11-04; the button in
# place of "written for whom", 2026-11-06; the PDF link gone with the PDF, 2026-11-12).
_BAR = (
    '<div class="ftd-bar">'
    f'<a href="tel:+61423853830">{_PHONE_ICON}0423 853 830</a>'
    f'<a href="mailto:analytics@freethedesk.com.au">{_MAIL_ICON}analytics@freethedesk.com.au</a>'
    '<a class="ftd-bar__cta" href="https://www.freethedesk.com.au/seo">Get the full report</a></div>'
)

# The ask: a band the page's width under the report, the site's light blue behind the SEO page's picture of what an
# audit reads, framed as that page frames it, beside the words (owner, 2026-11-06; the heading, the button and the
# picture, 2026-11-07, as the sample report's).
_ASK = (
    '<section class="ftd-ask" aria-labelledby="ftd-ask-title"><div class="ftd-ask__shell"><div>'
    '<b class="ftd-ask__eyebrow">The next step</b>'
    '<h2 id="ftd-ask-title">Get the full SEO report, written from your own data</h2>'
    "<p>This one was written from what anyone can see. The full report works from your Search Console and "
    "analytics, makes better-informed recommendations, and tracks whether each one worked.</p>"
    '<a href="https://www.freethedesk.com.au/seo">Explore SEO reports</a></div>'
    '<img src="https://www.freethedesk.com.au/images/seo/what-google-looks-at.webp" alt="" width="1536" '
    'height="1024" loading="lazy"></div></section>'
)


# The site's footer, as Footer.tsx sets it: the wordmark and the standing copy, how to reach us, where and when,
# the pages, the terms, then the legal line. The lists mirror siteConfig.ts (FOOTER_NAVIGATION, OPENING_HOURS).
_EXPLORE = (
    ("/website-development", "Website development"),
    ("/website-redesign-perth", "Website redesign"),
    ("/web-design-subiaco", "Web design Subiaco"),
    ("/seo", "SEO audits"),
    ("/automation", "Automation"),
    ("/dealers", "Dealerships"),
    ("/licensing", "Online licensing"),
    ("/guides", "SEO &amp; website guides"),
    ("/affiliates", "Affiliate program"),
    ("/contact", "Contact"),
)
_TERMS = (
    ("/legal/privacy", "Privacy policy"),
    ("/legal/dealer-subscription-terms", "Dealer subscription terms"),
    ("/legal/customer-terms", "Customer terms"),
    ("/legal/seo-audit-terms", "SEO audit terms"),
    ("/legal/affiliate-program-terms", "Affiliate program terms"),
    ("/legal/web-development-terms", "Web development terms"),
)
_WEEK = ("Mon", "Tue", "Wed", "Thu", "Fri")


def _links(rows) -> str:
    return "".join(f'<a href="{href}">{label}</a>' for href, label in rows)


def site_footer() -> str:
    hours = "".join(f"<dt>{day}</dt><dd>9:00 AM – 5:00 PM</dd>" for day in _WEEK)
    return (
        '<footer class="ftd-foot"><div class="ftd-foot__shell ftd-foot__grid">'
        '<div class="ftd-foot__brand"><a class="ftd-foot__mark" href="/">free<span class="ftd-foot__the">the</span>'
        'desk<span class="ftd-foot__dot">.</span></a>'
        "<p>Websites, web applications, automation and SEO audits for Perth businesses, built by a Perth development "
        "team with years of hands-on experience.</p></div>"
        '<div class="ftd-foot__col"><b class="ftd-foot__eyebrow">Contact</b>'
        '<a href="tel:+61423853830">0423 853 830</a><a href="mailto:hello@freethedesk.com.au">hello@freethedesk.com.au</a>'
        '<b class="ftd-foot__eyebrow ftd-foot__eyebrow--later">Based in</b><span>Perth, Western Australia</span>'
        f'<b class="ftd-foot__eyebrow ftd-foot__eyebrow--later">Hours</b><dl class="ftd-foot__hours">{hours}</dl></div>'
        f'<div class="ftd-foot__col"><b class="ftd-foot__eyebrow">Explore</b>{_links(_EXPLORE)}</div>'
        f'<div class="ftd-foot__col"><b class="ftd-foot__eyebrow">Terms &amp; policies</b>{_links(_TERMS)}</div>'
        '</div><div class="ftd-foot__shell ftd-foot__legal">'
        f"<span>&copy; {date.today().year} freethedesk</span><span>ABN 11 493 753 896</span>"
        "<span>Perth-based, with clients across Australia</span></div></footer>"
    )


def page_document(prospect: SeoProspect, document: str) -> str:
    """The report's HTML with the robots meta and the link-preview tags in its head, the site's strip over it, the
    ask under it and the site's footer last. Every link to the SEO page, the report's own and the site's, goes
    through ``seo_link``, so a click is logged; a report already uploaded is tracked as it is served."""
    document = SEO_PAGE.sub(f'href="{seo_link(prospect, "report")}"', document)
    document = document.replace("<head>", f"<head>\n{ROBOTS}\n{preview_tags(prospect)}\n{_STYLE}", 1)
    document = document.replace("<body>", "<body>\n" + SEO_PAGE.sub(f'href="{seo_link(prospect, "bar")}"', _BAR), 1)
    foot = document.rfind("</body>")
    tail = SEO_PAGE.sub(f'href="{seo_link(prospect, "ask")}"', _ASK) + "\n" + site_footer() + "\n"
    return document[:foot] + tail + document[foot:] if foot >= 0 else document + tail


def page_headers(response):
    """A page for one reader: never indexed, never cached by anything between, never a referrer."""
    response["X-Robots-Tag"] = "noindex, nofollow, noarchive"
    response["Cache-Control"] = "private, no-store"
    response["Referrer-Policy"] = "no-referrer"
    return response
