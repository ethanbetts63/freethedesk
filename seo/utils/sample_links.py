"""A sample's companion report at ``freethedesk.com.au/reports/<business>-<token>``, beside the prospect reports.

The same address, the same noindexed, uncached page and the same site footer as a prospect report
(``prospect_links``); what differs is the strip over it, whose button opens the redesign the report describes, and
that nothing is sent from here and no ask band follows: the report's own last section is the next step.
"""

from html import escape

from django.utils.text import slugify

from core.utils.urls import site_url

from ..models import SeoSampleReport
from .prospect_links import _MAIL_ICON, _PHONE_ICON, _STYLE, NAME_LENGTH, ROBOTS, site_footer

#: The picture a chat or text app shows beside the link: the site's own.
PREVIEW_IMAGE = "/og-images/og-default.webp"


def sample_key(sample: SeoSampleReport) -> str:
    name = slugify(sample.business)[:NAME_LENGTH].strip("-")
    return f"{name}-{sample.link_token}" if name else sample.link_token


def sample_link(sample: SeoSampleReport) -> str:
    return f"{site_url()}/reports/{sample_key(sample)}"


def _preview_tags(sample: SeoSampleReport) -> str:
    title = escape(f"{sample.business}: website redesign")
    line = escape(f"A concept redesign of {sample.business}'s website: what changed, and why each change matters. "
                  "By freethedesk.")
    image = escape(f"{site_url()}{PREVIEW_IMAGE}")
    url = escape(sample_link(sample))
    return "\n".join((
        f'<meta property="og:title" content="{title}">',
        f'<meta property="og:description" content="{line}">',
        f'<meta property="og:image" content="{image}">',
        f'<meta property="og:url" content="{url}">',
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="freethedesk">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{title}">',
        f'<meta name="twitter:description" content="{line}">',
    ))


def demo_link(sample: SeoSampleReport, source: str = "") -> str:
    """The redesign's address, with ``?s=<source>`` when the link is placed somewhere its visits should name (the
    counter on the redesign's pages reads it; ``SeoSampleVisitView``)."""
    return f"{sample.demo_url}?s={source}" if source else sample.demo_url


def _bar(sample: SeoSampleReport) -> str:
    demo = escape(demo_link(sample, "report"), quote=True)
    return (
        '<div class="ftd-bar">'
        f'<a href="tel:+61423853830">{_PHONE_ICON}0423 853 830</a>'
        f'<a href="mailto:analytics@freethedesk.com.au">{_MAIL_ICON}analytics@freethedesk.com.au</a>'
        f'<a class="ftd-bar__cta" href="{demo}" target="_blank" rel="noopener">Open the redesign</a></div>'
    )


def sample_page_document(sample: SeoSampleReport, document: str) -> str:
    """The report's HTML with the robots meta and the link-preview tags in its head, the strip over it and the site's
    footer last."""
    document = document.replace("<head>", f"<head>\n{ROBOTS}\n{_preview_tags(sample)}\n{_STYLE}", 1)
    document = document.replace("<body>", "<body>\n" + _bar(sample), 1)
    foot = document.rfind("</body>")
    tail = site_footer() + "\n"
    return document[:foot] + tail + document[foot:] if foot >= 0 else document + tail
