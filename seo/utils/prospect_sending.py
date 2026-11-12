"""The prospect report email: which subject and which body a business gets, what is sent, and sending it.

The report is written the same way for everyone; the email is where the purpose
shows. The server composes every body from the row's own fields (the business,
its paid searches when a sweep saw its ad, the report's two strongest titles,
the count) so the pipeline knows nothing about why a report was written. A
client prospect gets body 5; a podcast host (an affiliate prospect) gets body 3 and subject 8; a coach or adviser
(a partner prospect) gets body 6 and subject 9.
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
    # A podcast host's, every host (owner's words, 2026-11-11): the email says what it is.
    SeoProspect.Subject.EIGHT: "Podcast affiliate offer for {business}",
    # A coach's or adviser's, every one (owner's words, 2026-11-11).
    SeoProspect.Subject.NINE: "A partnership idea for {business}",
}
# Subjects that need a paid search to make sense.
NEEDS_SEARCH = {SeoProspect.Subject.THREE, SeoProspect.Subject.FIVE}
# Retired from the rotation (owner's call, 2026-10-30: no "SEO" and no "free" in a subject): kept so the rows
# that drew them still read right. 3 (with a paid search), 6 and 7 rotate.
PAUSED_SUBJECTS = {SeoProspect.Subject.ONE, SeoProspect.Subject.TWO, SeoProspect.Subject.FOUR, SeoProspect.Subject.FIVE}
# A podcast host's subject and a partner's, each its own and out of the client rotation.
AFFILIATE_SUBJECT = SeoProspect.Subject.EIGHT
PARTNER_SUBJECT = SeoProspect.Subject.NINE
OWN_SUBJECTS = {SeoProspect.Purpose.AFFILIATE: AFFILIATE_SUBJECT, SeoProspect.Purpose.PARTNER: PARTNER_SUBJECT}

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

# Body 5, the fixes list: the only client body. The owner's words of 2026-11-11: every title, whole, and the report
# read by its link. The way out closes it, as bodies 1 and 3 do.
BODY_FIXES = """Hi {first_name},

I'm a real person who spent real time on this. My name's Ethan. I've written a list of fixes for your website. There's no obligation. Some of the people I write these for buy a full report later, that's why I do it. The fixes are worth doing either way.

Every recommendation explains the issue, why it's important and how to fix it. Here they are:

{listing}

You can read the whole report here: {link}

Forward the link to whoever runs your website, if they disagree with the recommendations I'd be very surprised.

If you want to go through it first, my number is below. I can explain any part in detail. """ + UNSUBSCRIBE_LINE + """

""" + SIGNATURE


# Body 3, for a podcast host (owner's words, 2026-11-11): the fixes list as a sample of what they would be
# advertising, every title listed, read by its link, then the affiliate offer. The figures are the site settings' as
# they stand on the day it is sent, like the podcast pitch's.
BODY_AFFILIATE = """Hi {first_name},

I'm a real person who spent real time on this. My name's Ethan. I've written a list of fixes for your website. There's no obligation, and the fixes are worth doing.

This is a sample so that you have an idea of what you'd be advertising if you're interested.

Every recommendation explains the issue, why it's important and how to fix it. Here they are:

{listing}

You can read the whole report here: {link}

Forward the link to whoever runs your website, if they disagree with the recommendations I'd be very surprised.

Now the offer. We are running an affiliate program for podcasts. Your listeners get {discount} off an SEO report with your code, and you get {share} of every report they buy: {commission_low} to {commission_high} each, paid after each sale. Everything's explained here: www.freethedesk.com.au/affiliates

If you want to go through it first, my number is below. I can explain any part in detail. """ + UNSUBSCRIBE_LINE + """

""" + SIGNATURE


# Body 6, for a coach or adviser (owner's words, 2026-11-11): the fixes list as a sample of what we would do for their
# clients, then the partnership: the affiliate program's discount and share, at the live figures, for their clients.
BODY_PARTNER = """Hi {first_name},

I'm a real person who spent real time on this. My name's Ethan. I've written a list of fixes for your website. There's no obligation, and the fixes are worth doing.

I'm writing because I'd like to partner with you. You work with business owners, and plenty of them will have websites with the same kind of problems as yours. You help them run the business; I show them what's stopping their website from bringing in work. This report is a sample of what I'd do for your clients.

Every recommendation explains the issue, why it's important and how to fix it. Here they are:

{listing}

You can read the whole report here: {link}

Forward the link to whoever runs your website, if they disagree with the recommendations I'd be very surprised.

Here's how the partnership would work. Your clients get {discount} off a report with your code, and you get {share} of what they pay: {commission_low} to {commission_high} a report, paid after each sale. Your clients get something useful at a better price, and you get paid for recommending it. Everything's explained here: www.freethedesk.com.au/affiliates

If you'd like to talk it over first, my number is below. """ + UNSUBSCRIBE_LINE + """

""" + SIGNATURE


def message_type(subject_version) -> str:
    return f"seo_prospect.{int(subject_version)}"


def live_subjects(has_search: bool = True, purpose: str = SeoProspect.Purpose.CLIENT) -> list:
    """The subjects a prospect may draw: a host's or a partner's own, else the client rotation it has the search for."""
    if purpose in OWN_SUBJECTS:
        return [OWN_SUBJECTS[purpose]]
    own = set(OWN_SUBJECTS.values())
    return [s for s in SeoProspect.Subject.values
            if s not in PAUSED_SUBJECTS and s not in own and (has_search or s not in NEEDS_SEARCH)]


def next_subject(has_search: bool = True, purpose: str = SeoProspect.Purpose.CLIENT) -> int:
    """The subject with the fewest prospects, so the test stays level."""
    counts = {
        row["subject_version"]: row["n"]
        for row in SeoProspect.objects.values("subject_version").annotate(n=Count("id"))
    }
    choices = live_subjects(has_search, purpose)
    if not choices:
        raise NoSubject("No subject line is in rotation for a prospect without a paid search; approve one first.")
    return min(choices, key=lambda s: (counts.get(s, 0), s))


# The client bodies in the test today: the fixes list alone (owner's call, 2026-10-30). Bodies 1, 2 and 4 are paused,
# not deleted: rows that drew them still show and send them.
CLIENT_BODIES = [SeoProspect.Body.FIXES]


class NoSubject(Exception):
    """No subject is in the rotation for this prospect: every live one needs a paid search it has none of."""


def next_body(purpose: str = SeoProspect.Purpose.CLIENT) -> int:
    """An affiliate's or a partner's body; else the client body with the fewest prospects, levelled when there is
    more than one."""
    if purpose == SeoProspect.Purpose.AFFILIATE:
        return SeoProspect.Body.AFFILIATE
    if purpose == SeoProspect.Purpose.PARTNER:
        return SeoProspect.Body.PARTNER
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


def listing(prospect: SeoProspect, shown: int = LIST_SHOWN, whole: bool = False) -> str:
    """The list: the first ``shown`` titles, numbered and cut to a line (``whole``: as written), then how many more
    the report holds."""
    titles = [t for t in (prospect.issues or [])[:shown] if t and t.strip()]
    lines = [f"{n}. {t.strip().rstrip('.') if whole else cut(t)}" for n, t in enumerate(titles, 1)]
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
    if version in (SeoProspect.Body.FIXES, SeoProspect.Body.AFFILIATE, SeoProspect.Body.PARTNER):
        from .prospect_links import report_link  # the link module reads the models; sending reads it

        every = listing(prospect, len(prospect.issues or []), whole=True)
        link = report_link(prospect, source)
        if version == SeoProspect.Body.FIXES:
            return BODY_FIXES.format(first_name=name, listing=every, link=link)
        if version == SeoProspect.Body.PARTNER:
            return BODY_PARTNER.format(first_name=name, listing=every, link=link, **affiliate_figures())
        return BODY_AFFILIATE.format(first_name=name, listing=every, link=link, **affiliate_figures())
    if version == SeoProspect.Body.LIST:
        return BODY_LIST.format(first_name=name, metric=prospect.metric or "bookings", listing=listing(prospect))
    if prospect.body:
        body = prospect.body.rstrip()
        if "no thanks" not in body.lower():
            body = f"{body}\n\n{UNSUBSCRIBE_LINE}"
        return body + "\n"
    return BODY_ONE.format(
        first_name=name, picked=picked(prospect), count=prospect.recommendation_count,
        standouts=standouts(prospect),
    )


#: The follow-up, a week on (owner, 2026-11-04), and once more on the owner's word (``again``, 2026-11-11): the report again under a subject from the live rotation, not
#: the report email's, and the body of the day, opening with this line. Both are chosen when it is queued and
#: kept on the row, so the dashboard can read replies against them.
FOLLOW_UP_AFTER = timedelta(days=7)
FOLLOW_UP_LINE = "Just following up on my previous email, in case it got buried."


def follow_up_type(subject_version) -> str:
    """Not ``seo_prospect.``: the dashboard's status reads the report email alone."""
    return f"seo_prospect_follow_up.{int(subject_version)}"


def next_follow_up_subject(prospect: SeoProspect) -> int:
    """A live subject neither the report email nor an earlier follow-up used, the one fewest follow-ups have drawn;
    the report email's own only when it is the sole live subject for this prospect."""
    has_search = bool([s for s in (prospect.paid_searches or []) if s])
    choices = live_subjects(has_search, prospect.purpose)
    seen = {prospect.subject_version, prospect.follow_up_subject_version}
    choices = ([s for s in choices if s not in seen] or [s for s in choices if s != prospect.subject_version]
               or choices)
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


def follow_up_refusal(prospect: SeoProspect, now, early: bool = False, again: bool = False) -> str:
    """Why this prospect may not be followed up now; empty when it may. ``early`` is the owner's word to go before
    the week is out: it lifts that wait alone. ``again`` is the owner's word for another follow-up after one has
    gone: it lifts that refusal alone, never one still waiting to go."""
    if prospect.follow_up_queued_at and not prospect.followed_up_at:
        return "already_queued"
    if prospect.followed_up_at and not again:
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
    """The follow-up: its own subject and body, the report linked again. The caller has claimed the row."""
    return send(
        to=prospect.email,
        channel="email",
        message_type=follow_up_type(prospect.follow_up_subject_version),
        subject=follow_up_subject_for(prospect),
        body=follow_up_body(prospect),
        plain=True,
        related=prospect,
        sender=settings.OUTREACH_SENDER,
    )


def eligible_prospects():
    """Approved and not yet sent, not excluded and not on the suppression list; oldest first. A held row (no
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
    """Email the report's link, the report's only copy. The caller has already claimed the row."""
    return send(
        to=prospect.email,
        channel="email",
        message_type=message_type(prospect.subject_version),
        subject=subject_for(prospect),
        body=body_for(prospect),
        # A note from one person, not a mailout: no branded frame, no HTML part.
        plain=True,
        related=prospect,
        # The outreach address and domain when they are configured; the site's own otherwise.
        sender=settings.OUTREACH_SENDER,
    )
