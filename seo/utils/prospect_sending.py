"""The prospect report email: which subject and which body a business gets, what is sent, and sending it.

The body is the report analyst's, written for this business and checked by the
pipeline's fact check; the server only picks the subject and makes sure the
email ends with the way out. Sent by the hourly ``send_affiliate_outreach``
run, inside its window. See ``_docs/seo-prospect-outreach.md``.
"""

from django.conf import settings
from django.db.models import Count
from freetheplatform.messaging import Suppression, send

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
}
# Subjects that need a paid search to make sense.
NEEDS_SEARCH = {SeoProspect.Subject.THREE, SeoProspect.Subject.FIVE}

# The Spam Act's unsubscribe facility: a reply, suppressed by hand on the dashboard.
UNSUBSCRIBE_LINE = "Reply 'no thanks' and I won't email again."

# Two bodies, levelled like the subjects (owner's call, 2026-10-30): body 1 is
# the analyst's email, written for the business; body 2 is the owner's fixed
# words, the same for every business but the name and what it counts. Its
# way out is the spam button, which it names twice; a 'no thanks' reply is
# still suppressed by hand. The words are the owner's: the source copy is
# ftp_search/_search/prospecting/call_script.md, "The report email, second body".
BODY_TWO = """Hi {first_name},

I spent three hours writing the attached website report. Make the listed changes and if your {metric} don't move in a month, mark this email as spam and I'll have earned it.

When they do move, all I ask is that you consider commissioning a full report from me. That's my marketing strategy.

Forward this to whoever runs your website. Every recommendation has the what, why and how spelt out. If your web guy disagrees I'd be very surprised.

If you want to go through it first, I'm a real person that spent real time on this, my number is below. I can explain any part in detail.

Ethan Betts
Lead Analyst, freethedesk
0423 853 830
www.freethedesk.com.au/seo
"""


def message_type(subject_version) -> str:
    return f"seo_prospect.{int(subject_version)}"


def next_subject(has_search: bool = True) -> int:
    """The subject with the fewest prospects, so the test stays level."""
    counts = {
        row["subject_version"]: row["n"]
        for row in SeoProspect.objects.values("subject_version").annotate(n=Count("id"))
    }
    choices = [s for s in SeoProspect.Subject.values if has_search or s not in NEEDS_SEARCH]
    return min(choices, key=lambda s: (counts.get(s, 0), s))


def next_body() -> int:
    """The body with the fewest prospects, so the test stays level: 1, 2, 1, 2."""
    counts = {
        row["body_version"]: row["n"]
        for row in SeoProspect.objects.values("body_version").annotate(n=Count("id"))
    }
    return min(SeoProspect.Body.values, key=lambda b: (counts.get(b, 0), b))


def first_name(prospect: SeoProspect) -> str:
    """The contact's first name for the greeting; 'there' when the row names no one."""
    return (prospect.contact_name or "").strip().split(" ")[0] or "there"


def subject_for(prospect: SeoProspect) -> str:
    return SUBJECTS[prospect.subject_version].format(
        count=prospect.recommendation_count,
        domain=prospect.domain,
        business=prospect.business,
        search=(prospect.paid_searches or [""])[0],
    )


def body_for(prospect: SeoProspect) -> str:
    """Body 2 filled in, or the analyst's body, ending with the unsubscribe line if the analyst left it out."""
    if prospect.body_version == SeoProspect.Body.BET:
        return BODY_TWO.format(first_name=first_name(prospect), metric=prospect.metric or "bookings")
    body = prospect.body.rstrip()
    if "no thanks" not in body.lower():
        body = f"{body}\n\n{UNSUBSCRIBE_LINE}"
    return body + "\n"


def eligible_prospects():
    """Queued, not excluded, and not on the suppression list; oldest first."""
    suppressed = Suppression.objects.filter(channel="email").values("address")
    return (
        SeoProspect.objects.filter(sent_at__isnull=True, excluded_reason="")
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
