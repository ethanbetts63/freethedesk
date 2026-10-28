"""The pitch: which version a prospect gets, what it says, and sending it.

The templates are ``core/templates/emails/podcast_pitch/{a,b,c}``, explained in
``_docs/affiliate-pitch/README.md``. Everything the templates ask for is built
here from the site settings, so a price change reaches the next send without
a deploy.
"""

from decimal import ROUND_HALF_UP, Decimal

from django.conf import settings
from django.db.models import Count
from freetheplatform.messaging import send

from core.models import SiteSettings

from ..models import PodcastProspect
from .unsubscribe import unsubscribe_url

VERSIONS = [PodcastProspect.Version.A, PodcastProspect.Version.B, PodcastProspect.Version.C]

# What goes out. A and C are one person writing to one host and are sent as plain text, no
# template and no HTML part: dressed in a frame, a note like that is filed under Promotions. B is
# the designed announcement, and is paused (owner's call 2026-10-28). Its prospects stay on the
# dashboard; any still queued are moved to an active version by the send command.
ACTIVE_VERSIONS = [PodcastProspect.Version.A, PodcastProspect.Version.C]
PAUSED_VERSIONS = [PodcastProspect.Version.B]

# Three subject lines a version, rotated by prospect id so each gets a third.
# C is A with no links, so it shares A's lines.
SUBJECTS = {
    PodcastProspect.Version.A: [
        "A free SEO audit for {podcast}",
        "Quick one about {podcast}",
        "{commission_high} an audit for {podcast}",
        "Thoughts on this?",
        "What do you think of this?",
        "Affiliate offer from freethedesk",
        "An idea for {podcast}",
    ],
    PodcastProspect.Version.B: [
        "The freethedesk podcast affiliate program",
        "An invitation for {podcast}",
        "{podcast} × freethedesk",
        "Half of every audit, for {podcast}",
        "A free audit and a code for {podcast}",
    ],
}
SUBJECTS[PodcastProspect.Version.C] = SUBJECTS[PodcastProspect.Version.A]


def message_type(version) -> str:
    return f"podcast_pitch.{version}"


def next_version() -> str:
    """The active version with the fewest prospects, so the lists stay level."""
    counts = {
        row["version"]: row["n"]
        for row in PodcastProspect.objects.values("version").annotate(n=Count("id"))
    }
    return min(ACTIVE_VERSIONS, key=lambda v: (counts.get(v, 0), ACTIVE_VERSIONS.index(v)))


def money(amount) -> str:
    """``$275`` for a whole number of dollars, ``$275.50`` otherwise."""
    amount = Decimal(amount)
    if amount == amount.to_integral_value():
        return f"${amount:,.0f}"
    return f"${amount:,.2f}"


def pitch_figures(site_settings=None) -> dict:
    """The offer as the site settings state it today."""
    site_settings = site_settings or SiteSettings.load()
    share = Decimal(site_settings.affiliate_share_percent) / 100
    paid = (100 - Decimal(site_settings.affiliate_discount_percent)) / 100

    def commission(price):
        # Half of what the listener pays after their discount, to the cent.
        return money((Decimal(price) * paid * share).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))

    return {
        "discount": f"{site_settings.affiliate_discount_percent}%",
        "commission_low": commission(site_settings.seo_essentials_price),
        "commission_high": commission(site_settings.seo_complete_price),
        "free_audit_price": money(site_settings.seo_plus_price),
    }


def pitch_context(prospect: PodcastProspect, figures: dict | None = None) -> dict:
    return {
        **(figures or pitch_figures()),
        "podcast": prospect.podcast_name,
        "first_name": prospect.first_name,
        "opener": prospect.opener,
        "sender_name": settings.OUTREACH_SENDER_NAME,
        "unsubscribe_url": unsubscribe_url(prospect),
    }


def pitch_subject(prospect: PodcastProspect, context: dict) -> str:
    lines = SUBJECTS[prospect.version]
    return lines[prospect.pk % len(lines)].format(**context)


def send_pitch(prospect: PodcastProspect, figures: dict | None = None):
    """Send the prospect's version of the pitch. The caller has already claimed the row."""
    context = pitch_context(prospect, figures)
    return send(
        to=prospect.email,
        channel="email",
        message_type=message_type(prospect.version),
        subject=pitch_subject(prospect, context),
        template=f"emails/podcast_pitch/{prospect.version}",
        context=context,
        # The template's .txt only, no HTML part: a personal email, not a mailout.
        plain=True,
        related=prospect,
        # The outreach address and domain when they are configured; the site's own otherwise.
        sender=settings.OUTREACH_SENDER,
    )
