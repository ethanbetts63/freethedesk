"""The sample email: a website sample's companion report link, sent once, on the owner's word (owner, 2026-11-19).

One subject and one body, in the owner's approved words, composed from the row: the first name, the domain, the
report's first four change titles and the report's link. Plain text, no HTML, no picture, no attachment. Held,
approved and sent the prospect reports' way: the pipeline holds the row (``POST /api/seo/samples/hold/``), the owner's
word approves it (``POST /api/seo/samples/approve/``), and the hourly ``send_affiliate_outreach`` run sends it inside
its window. A follow-up goes only when the owner asks (``POST /api/seo/samples/follow-up/``). The source copy of the
words is ``../ftp_search/_prospect/outreach/call_script.md``, "The sample email"; change both together. See
``_docs/sample-outreach.md``.
"""

from django.conf import settings
from freetheplatform.messaging import Suppression, send

from ..models import SeoSampleReport
from .prospect_sending import FOLLOW_UP_LINE
from .sample_links import sample_link

MESSAGE_TYPE = "seo_sample"
FOLLOW_UP_TYPE = "seo_sample_follow_up"

#: How many change titles the email lists: the report's first four cards, in the order it shows them.
TITLES_SHOWN = 4

SUBJECT = "A redesign of {domain}"

# The owner's words, approved 2026-11-19. The source copy is ftp_search's call_script.md, "The sample email";
# change both together.
BODY = """Hi {first_name},

My name's Ethan. I've rebuilt your website as a sample: the same pages, with your own words and photos, laid out to make it easier for customers to get in touch. There's no obligation. If you like it, I can put it live on your own domain.

The report goes through every change: what your site does now, what the redesign does instead, and why it matters to your customers or to Google. A few of them:

{listing}

You can read the report and click through to the redesign here: {link}

If you want to go through it first, my number is below. I can explain any part of it. Reply 'no thanks' and I won't email again.

Ethan Betts
Director, freethedesk
0423 853 830
www.freethedesk.com.au
"""


def subject_for(sample: SeoSampleReport) -> str:
    return SUBJECT.format(domain=sample.domain)


def listing(sample: SeoSampleReport) -> str:
    titles = [t.strip() for t in (sample.titles or []) if t and t.strip()][:TITLES_SHOWN]
    return "\n".join(f"{n}. {t}" for n, t in enumerate(titles, 1))


def body_for(sample: SeoSampleReport) -> str:
    return BODY.format(first_name=sample.first_name, listing=listing(sample), link=sample_link(sample))


def follow_up_body(sample: SeoSampleReport) -> str:
    """The same email, the follow-up line opening the paragraph after the greeting."""
    greeting, _, rest = body_for(sample).partition("\n\n")
    return f"{greeting}\n\n{FOLLOW_UP_LINE} {rest}"


def hold_problems(sample: SeoSampleReport) -> list[str]:
    """What the row lacks to be emailed as written; empty when it has it all."""
    missing = []
    if not sample.first_name.strip():
        missing.append("first_name")
    if not sample.email:
        missing.append("email")
    if not sample.domain.strip():
        missing.append("domain")
    if len([t for t in sample.titles or [] if t and t.strip()]) < TITLES_SHOWN:
        missing.append("titles")
    return missing


def _not_suppressed(queryset):
    return queryset.exclude(email__in=Suppression.objects.filter(channel="email").values("address"))


def eligible_samples():
    """Held, approved and not yet sent, not excluded and not on the suppression list; oldest approval first."""
    return _not_suppressed(
        SeoSampleReport.objects.filter(held_at__isnull=False, approved_at__isnull=False, sent_at__isnull=True,
                                       excluded_reason="").exclude(email="")
    ).order_by("approved_at", "id")


def claim(sample: SeoSampleReport, now) -> bool:
    """True for exactly one of any number of concurrent runs."""
    return SeoSampleReport.objects.filter(pk=sample.pk, sent_at__isnull=True).update(sent_at=now) == 1


def send_sample(sample: SeoSampleReport):
    """Email the report's link. The caller has already claimed the row."""
    return send(
        to=sample.email,
        channel="email",
        message_type=MESSAGE_TYPE,
        subject=subject_for(sample),
        body=body_for(sample),
        # A note from one person: no branded frame, no HTML part, no picture, no attachment (owner, 2026-11-19).
        plain=True,
        related=sample,
        sender=settings.OUTREACH_SENDER,
    )


def follow_up_refusal(sample: SeoSampleReport, again: bool = False) -> str:
    """Why this sample may not be followed up now; empty when it may. The owner's word is the only trigger, so there
    is no wait; ``again`` lifts the refusal of a second after one has gone, never one still waiting."""
    if sample.follow_up_queued_at and not sample.followed_up_at:
        return "already_queued"
    if sample.followed_up_at and not again:
        return "already_followed_up"
    if not sample.sent_at:
        return "not_sent"
    if sample.excluded_reason:
        return "excluded"
    if Suppression.objects.filter(channel="email", address=sample.email).exists():
        return "suppressed"
    return ""


def due_follow_ups():
    return _not_suppressed(
        SeoSampleReport.objects.filter(follow_up_queued_at__isnull=False, followed_up_at__isnull=True,
                                       sent_at__isnull=False, excluded_reason="")
    ).order_by("follow_up_queued_at", "id")


def claim_follow_up(sample: SeoSampleReport, now) -> bool:
    return SeoSampleReport.objects.filter(pk=sample.pk, followed_up_at__isnull=True).update(followed_up_at=now) == 1


def send_follow_up(sample: SeoSampleReport):
    return send(
        to=sample.email,
        channel="email",
        message_type=FOLLOW_UP_TYPE,
        subject=subject_for(sample),
        body=follow_up_body(sample),
        plain=True,
        related=sample,
        sender=settings.OUTREACH_SENDER,
    )
