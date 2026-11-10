"""The prospect report email: which subject and which body a business gets, what is sent, and sending it.

The report is written the same way for everyone; the email is where the purpose
shows. The server composes every body from the row's own fields (the business,
its paid searches when a sweep saw its ad, the report's two strongest titles,
the count) so the pipeline knows nothing about why a report was written. A
client prospect gets body 1 or 2, levelled; an affiliate prospect gets body 3.
Sent by the hourly ``send_affiliate_outreach`` run, inside its window. See
``_docs/seo-prospect-outreach.md``.
"""

from datetime import timedelta

from django.conf import settings
from django.db.models import Count
from freetheplatform.messaging import Suppression, send

from core.models import SiteSettings

from ..models import SeoProspect

# Five subjects, rotated so each gets a fifth, and read against replies on the
# dashboard (owner's call, 2026-10-28). Each names only what the report says:
# its count, the business and the first search its ad was seen on. Three hours
# is every report's figure, by the owner's decision (2026-10-30); nothing counts it.
HOURS = 3
SUBJECTS = {
    SeoProspect.Subject.ONE: f"I spent {HOURS} hours on this. I am not a bot.",
    SeoProspect.Subject.TWO: "{count} free fixes for {domain}",
    SeoProspect.Subject.THREE: "Your '{search}' ad, and what your site is missing",
    SeoProspect.Subject.FOUR: "A free SEO report for {business}",
    SeoProspect.Subject.FIVE: "{business} isn't on Google's first page for '{search}'",
    # Approved 2026-10-30, written for body 5: no "SEO" and no "free".
    SeoProspect.Subject.SIX: "A list of fixes for {domain}",
    SeoProspect.Subject.SEVEN: "What's wrong with {domain}, and how to fix it",
}
# Subjects that need a paid search to make sense.
NEEDS_SEARCH = {SeoProspect.Subject.THREE, SeoProspect.Subject.FIVE}
# Retired from the rotation (owner's call, 2026-10-30: no "SEO" and no "free" in a subject): kept so the rows
# that drew them still read right. 3 (with a paid search), 6 and 7 rotate.
PAUSED_SUBJECTS = {SeoProspect.Subject.ONE, SeoProspect.Subject.TWO, SeoProspect.Subject.FOUR, SeoProspect.Subject.FIVE}

# The Spam Act's unsubscribe facility: a reply, suppressed by hand on the dashboard.
UNSUBSCRIBE_LINE = "Reply 'no thanks' and I won't email again."

SIGNATURE = """Ethan Betts
Director, freethedesk
0423 853 830
www.freethedesk.com.au/seo
"""

# Body 1, the report email, in the words the analyst's email used until
# 2026-10-30, now composed here. ``{picked}`` is why this business: its ad on
# searches it does not win, when a sweep saw one, else its site alone.
BODY_ONE = """Hi {first_name},

{picked}

So I wrote you a report. Attached: {count} recommendations, from what anyone can see of your site, your Google listing and the search results. {standouts}

The attached report is free for you, but it wasn't for me: about three hours of compute and an hour of my time. The recommendations rest on published SEO studies, large SEO firms' datasets and Google's own guidance.

My intent is simple: do good work for free, and hope you'll see the value in the paid version. The full report works from your own data, makes better-informed recommendations, and tracks whether each one worked: www.freethedesk.com.au/seo.

I'd be happy to walk you through the report. If you have questions my number is below. Reply 'no thanks' and I won't email again.

""" + SIGNATURE

PICKED_FOR_ADS = (
    "I picked {business} because you're paying for ads on searches your website performs poorly on. "
    "Google showed your ad for '{search}', and without it {business} was nowhere on that search: "
    "not in the map box, not in the first page of free results.{more}"
)
PICKED_FOR_SITE = (
    "I picked {business} because your website should be doing more for you than it is, "
    "and most of what is holding it back can be seen from the outside."
)

# Body 2, the owner's fixed words (owner's call, 2026-10-30): the same for every
# client but the name and what it counts. Its way out is the spam button, which
# it names twice; a 'no thanks' reply is still suppressed by hand. The source
# copy is ftp_search/_search/prospecting/call_script.md, "The report email, second body".
BODY_TWO = """Hi {first_name},

I spent three hours writing the attached website report. Make the listed changes and if your {metric} don't move in a month, mark this email as spam and I'll have earned it.

When they do move, all I ask is that you consider commissioning a full report from me. That's my marketing strategy.

Forward this to whoever runs your website. Every recommendation has the what, why and how spelt out. If your web guy disagrees I'd be very surprised.

If you want to go through it first, I'm a real person that spent real time on this, my number is below. I can explain any part in detail.

""" + SIGNATURE

# Body 4, the bet with the list (owner's call, 2026-10-30): body 2 with the report's five
# highest-impact titles, each cut to a line, under the strategy line, and the rest counted.
BODY_LIST = """Hi {first_name},

I spent three hours writing the attached website report. Make the listed changes and if your {metric} don't move in a month, mark this email as spam and I'll have earned it.

When they do move, all I ask is that you consider commissioning a full report from me. That's my marketing strategy.

{listing}

Forward the attached pdf to whoever runs your website. Every recommendation has the what, why and how spelt out. If your web guy disagrees I'd be very surprised.

If you want to go through it first, I'm a real person that spent real time on this, my number is below. I can explain any part in detail.

""" + SIGNATURE
LIST_SHOWN = 5
LIST_WIDTH = 50

# Body 5, the fixes list (owner's words, 2026-10-30): the only client body. Three titles, cut to a line, and the
# rest counted. The way out closes it, as bodies 1 and 3 do (owner, 2026-11-04), and so the follow-up built from it.
BODY_FIXES = """Hi {first_name},

My name's Ethan. Attached is a list of fixes for your website. I'm a real person who spent real time on this. There's no obligation. Some of the people I write these for buy a full report later, that's why I do it. The fixes are worth doing either way.

Every recommendation explains the issue, why it's important and how to fix it. Here's the first few:

{listing}
{online}
Forward the attached pdf to whoever runs your website, if they disagree with the recommendations I'd be very surprised.

If you want to go through it first, my number is below. I can explain any part in detail. Reply 'no thanks' and I won't email again.

""" + SIGNATURE
FIXES_SHOWN = 3

#: The line under the list naming the report's page (owner, 2026-11-04): the same report, read on a phone without
#: opening the attachment; the opens it draws are counted against the email it came from. Rows from before the
#: page existed have none, and the line is left out.
ONLINE_LINE = "\nYou can also read it online: {link}\n"


def online_line(prospect: SeoProspect, source: str) -> str:
    from .prospect_links import report_link  # the link module reads the models; sending reads it

    return ONLINE_LINE.format(link=report_link(prospect, source)) if prospect.report_html else ""

# Body 3, for a podcast host (owner's call, 2026-10-30): the same report, then
# the affiliate offer instead of the paid one. The figures are the site
# settings' as they stand on the day it is sent, like the podcast pitch's.
BODY_AFFILIATE = """Hi {first_name},

I picked {business} because your listeners are the people we write for: owners of small businesses whose websites could be doing more. So I wrote a report about your own site, the way I'd write one for them. Attached: {count} recommendations, from what anyone can see of {domain} and the search results. {standouts}

The report is yours, free, whatever you make of the rest of this email.

Here's the rest. freethedesk runs an affiliate program for podcasts like yours. Your listeners get {discount} off an SEO audit with your code, and you get {share} of every audit they buy: {commission_low} to {commission_high} an audit, paid to you after each sale. Sign up at www.freethedesk.com.au/affiliates and the full version of this report, the one customers pay {free_audit_price} for, is written for you free as part of it.

I'd be happy to walk you through the report. If you have questions my number is below. Reply 'no thanks' and I won't email again.

""" + SIGNATURE


def message_type(subject_version) -> str:
    return f"seo_prospect.{int(subject_version)}"


def next_subject(has_search: bool = True) -> int:
    """The subject with the fewest prospects, so the test stays level."""
    counts = {
        row["subject_version"]: row["n"]
        for row in SeoProspect.objects.values("subject_version").annotate(n=Count("id"))
    }
    choices = [s for s in SeoProspect.Subject.values
               if s not in PAUSED_SUBJECTS and (has_search or s not in NEEDS_SEARCH)]
    if not choices:
        raise NoSubject("No subject line is in rotation for a prospect without a paid search; approve one first.")
    return min(choices, key=lambda s: (counts.get(s, 0), s))


# The client bodies in the test today: the fixes list alone (owner's call, 2026-10-30). Bodies 1, 2 and 4 are paused,
# not deleted: rows that drew them still show and send them.
CLIENT_BODIES = [SeoProspect.Body.FIXES]


class NoSubject(Exception):
    """No subject is in the rotation for this prospect: every live one needs a paid search it has none of."""


def next_body(purpose: str = SeoProspect.Purpose.CLIENT) -> int:
    """An affiliate's body; else the client body with the fewest prospects, levelled when there is more than one."""
    if purpose == SeoProspect.Purpose.AFFILIATE:
        return SeoProspect.Body.AFFILIATE
    counts = {
        row["body_version"]: row["n"]
        for row in SeoProspect.objects.values("body_version").annotate(n=Count("id"))
    }
    return min(CLIENT_BODIES, key=lambda b: (counts.get(b, 0), b))


def first_name(prospect: SeoProspect) -> str:
    """The contact's first name for the greeting; 'there' when the row names no one."""
    return (prospect.contact_name or "").strip().split(" ")[0] or "there"


def subject_for(prospect: SeoProspect, version=None) -> str:
    """The report email's subject, or the follow-up's when ``version`` names it."""
    return SUBJECTS[prospect.subject_version if version is None else version].format(
        count=prospect.recommendation_count,
        domain=prospect.domain,
        business=prospect.business,
        search=(prospect.paid_searches or [""])[0],
    )


def standouts(prospect: SeoProspect) -> str:
    """The sentence naming the report's strongest findings: the first two of ``issues``, the report's
    highest-impact titles, in the plain lowercase of a sentence; nothing when the row holds none."""
    titles = [t.strip().rstrip(".") for t in (prospect.issues or [])[:2] if t and t.strip()]
    titles = [t[:1].lower() + t[1:] for t in titles]
    if len(titles) == 2:
        return f"Two stand out: {titles[0]}, and {titles[1]}."
    if len(titles) == 1:
        return f"One stands out: {titles[0]}."
    return ""


def cut(title: str, width: int = LIST_WIDTH) -> str:
    """A title cut to about ``width`` characters at a word, with an ellipsis; a short one whole."""
    title = title.strip().rstrip(".")
    if len(title) <= width:
        return title
    head = title[:width].rsplit(" ", 1)[0].rstrip(",;:")
    return f"{head}\u2026"


def listing(prospect: SeoProspect, shown: int = LIST_SHOWN) -> str:
    """The list: the first ``shown`` titles, numbered and cut to a line, then how many more the report holds."""
    titles = [t for t in (prospect.issues or [])[:shown] if t and t.strip()]
    lines = [f"{n}. {cut(t)}" for n, t in enumerate(titles, 1)]
    more = max(int(prospect.recommendation_count or 0) - len(titles), 0)
    if more:
        lines.append(f"({more} more)")
    return "\n".join(lines)


def picked(prospect: SeoProspect) -> str:
    """Why this business, for body 1: its ad on searches it does not win, when a sweep saw one."""
    searches = [s for s in (prospect.paid_searches or []) if s]
    if not searches:
        return PICKED_FOR_SITE.format(business=prospect.business)
    rest = searches[1:3]
    more = " The same was true for " + " and ".join(f"'{s}'" for s in rest) + "." if rest else ""
    return PICKED_FOR_ADS.format(business=prospect.business, search=searches[0], more=more)


def affiliate_figures() -> dict:
    """The offer as the site settings state it today: the podcast pitch's figures, and the share as a word."""
    from affiliates.utils.pitching import pitch_figures  # the pitch's own arithmetic

    site_settings = SiteSettings.load()
    share = int(site_settings.affiliate_share_percent)
    return {**pitch_figures(site_settings), "share": "half" if share == 50 else f"{share}%"}


def body_for(prospect: SeoProspect, version=None, source: str = "email") -> str:
    """The email as it goes, or went, composed from the row; the follow-up's when ``version`` names its body.
    ``source`` is what the report's link in it says it came from.

    A row from before 2026-10-30 holds the analyst's email in ``body``, which
    body 1 sent as written with the way out added if the analyst left it out;
    that is kept so the dashboard shows what went.
    """
    version = prospect.body_version if version is None else version
    name = first_name(prospect)
    if version == SeoProspect.Body.BET:
        return BODY_TWO.format(first_name=name, metric=prospect.metric or "bookings")
    if version == SeoProspect.Body.FIXES:
        return BODY_FIXES.format(first_name=name, listing=listing(prospect, FIXES_SHOWN),
                                 online=online_line(prospect, source))
    if version == SeoProspect.Body.LIST:
        return BODY_LIST.format(first_name=name, metric=prospect.metric or "bookings", listing=listing(prospect))
    if version == SeoProspect.Body.AFFILIATE:
        return BODY_AFFILIATE.format(
            first_name=name, business=prospect.business, domain=prospect.domain,
            count=prospect.recommendation_count, standouts=standouts(prospect), **affiliate_figures(),
        )
    if prospect.body:
        body = prospect.body.rstrip()
        if "no thanks" not in body.lower():
            body = f"{body}\n\n{UNSUBSCRIBE_LINE}"
        return body + "\n"
    return BODY_ONE.format(
        first_name=name, picked=picked(prospect), count=prospect.recommendation_count,
        standouts=standouts(prospect),
    )


#: The one follow-up, a week on (owner, 2026-11-04): the report again under a subject from the live rotation, not
#: the report email's, and the body of the day, opening with this line. Both are chosen when it is queued and
#: kept on the row, so the dashboard can read replies against them.
FOLLOW_UP_AFTER = timedelta(days=7)
FOLLOW_UP_LINE = "Just following up on my email from last week, in case it got buried."


def follow_up_type(subject_version) -> str:
    """Not ``seo_prospect.``: the dashboard's status reads the report email alone."""
    return f"seo_prospect_follow_up.{int(subject_version)}"


def next_follow_up_subject(prospect: SeoProspect) -> int:
    """A live subject other than the report email's, the one fewest follow-ups have drawn; the report email's own
    only when it is the sole live subject for this prospect."""
    has_search = bool([s for s in (prospect.paid_searches or []) if s])
    choices = [s for s in SeoProspect.Subject.values
               if s not in PAUSED_SUBJECTS and (has_search or s not in NEEDS_SEARCH)]
    choices = [s for s in choices if s != prospect.subject_version] or choices
    if not choices:
        raise NoSubject("No subject line is in rotation for a prospect without a paid search; approve one first.")
    counts = {
        row["follow_up_subject_version"]: row["n"]
        for row in SeoProspect.objects.filter(follow_up_subject_version__isnull=False)
        .values("follow_up_subject_version").annotate(n=Count("id"))
    }
    return min(choices, key=lambda s: (counts.get(s, 0), s))


def follow_up_subject_for(prospect: SeoProspect) -> str:
    return subject_for(prospect, prospect.follow_up_subject_version)


def follow_up_body(prospect: SeoProspect) -> str:
    """The follow-up's body, with the follow-up line opening the paragraph after the greeting."""
    greeting, _, rest = body_for(prospect, prospect.follow_up_body_version, source="follow-up").partition("\n\n")
    return f"{greeting}\n\n{FOLLOW_UP_LINE} {rest}"


def follow_up_refusal(prospect: SeoProspect, now, early: bool = False) -> str:
    """Why this prospect may not be followed up now; empty when it may. ``early`` is the owner's word to go before
    the week is out: it lifts that wait alone."""
    if prospect.follow_up_queued_at or prospect.followed_up_at:
        return "already_queued"
    if not prospect.sent_at:
        return "not_sent"
    if not early and now - prospect.sent_at < FOLLOW_UP_AFTER:
        return "too_soon"
    if prospect.called_at:
        return "called"
    if prospect.reply != SeoProspect.Reply.NONE:
        return "replied"
    if prospect.excluded_reason:
        return "excluded"
    if Suppression.objects.filter(channel="email", address=prospect.email).exists():
        return "suppressed"
    return ""


def due_follow_ups():
    """Queued, not yet sent, and still nothing has stopped them since: no call, reply, exclusion or suppression."""
    suppressed = Suppression.objects.filter(channel="email").values("address")
    return (
        SeoProspect.objects.filter(follow_up_queued_at__isnull=False, followed_up_at__isnull=True,
                                   called_at__isnull=True, reply=SeoProspect.Reply.NONE, excluded_reason="")
        .exclude(email__in=suppressed)
        .order_by("follow_up_queued_at", "id")
    )


def claim_follow_up(prospect: SeoProspect, now) -> bool:
    """True for exactly one of any number of concurrent runs."""
    return SeoProspect.objects.filter(pk=prospect.pk, followed_up_at__isnull=True).update(followed_up_at=now) == 1


def send_follow_up(prospect: SeoProspect):
    """The follow-up: its own subject and body, the report attached again. The caller has claimed the row."""
    with prospect.report_pdf.open("rb") as handle:
        pdf = handle.read()
    return send(
        to=prospect.email,
        channel="email",
        message_type=follow_up_type(prospect.follow_up_subject_version),
        subject=follow_up_subject_for(prospect),
        body=follow_up_body(prospect),
        plain=True,
        attachments=[(f"{prospect.slug}_seo_report_{prospect.report_version}.pdf", pdf, "application/pdf")],
        related=prospect,
        sender=settings.OUTREACH_SENDER,
    )


def eligible_prospects():
    """Approved and not yet sent, not excluded, and not on the suppression list; oldest first. A held row (no
    ``approved_at``) is the owner's to read first."""
    suppressed = Suppression.objects.filter(channel="email").values("address")
    return (
        SeoProspect.objects.filter(approved_at__isnull=False, sent_at__isnull=True, excluded_reason="")
        .exclude(email__in=suppressed)
        .order_by("created_at", "id")
    )


def claim(prospect: SeoProspect, now) -> bool:
    """True for exactly one of any number of concurrent runs."""
    return SeoProspect.objects.filter(pk=prospect.pk, sent_at__isnull=True).update(sent_at=now) == 1


def send_prospect(prospect: SeoProspect):
    """Email the report. The caller has already claimed the row."""
    with prospect.report_pdf.open("rb") as handle:
        pdf = handle.read()
    return send(
        to=prospect.email,
        channel="email",
        message_type=message_type(prospect.subject_version),
        subject=subject_for(prospect),
        body=body_for(prospect),
        # A note from one person, not a mailout: no branded frame, no HTML part.
        plain=True,
        attachments=[(f"{prospect.slug}_seo_report_{prospect.report_version}.pdf", pdf, "application/pdf")],
        related=prospect,
        # The outreach address and domain when they are configured; the site's own otherwise.
        sender=settings.OUTREACH_SENDER,
    )
