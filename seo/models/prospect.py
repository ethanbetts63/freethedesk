import secrets

from django.db import models

from .storage import private_prospect_report_storage


#: Ten characters from an alphabet with no 0/o, 1/l/i: a link read out on a call must be typed as heard.
LINK_TOKEN_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"
LINK_TOKEN_LENGTH = 10


def new_link_token() -> str:
    return "".join(secrets.choice(LINK_TOKEN_ALPHABET) for _ in range(LINK_TOKEN_LENGTH))


class SeoProspect(models.Model):
    """A business sent a free prospect SEO report, and the call that follows it.

    Rows arrive through ``POST /api/seo/prospects/`` from the report pipeline
    (``../ftp_search``, ``_search/tools/prospecting/outbox.py add``) as soon as
    a report is published, held: the row gives the report its link, which the
    owner reads it at. ``POST /api/seo/prospects/approve/`` records the owner's
    word (``approved_at``), and only then does the hourly
    ``send_affiliate_outreach`` run email it, in Perth business hours (owner,
    2026-11-05: uploaded when done, sent only when approved). One report per
    business; the page and PDF may be replaced, nothing else is updated. The report is the same whatever the
    ``purpose``; the email differs: a business is asked to consider the paid
    report, a podcast host is offered the affiliate program.
    Whether and when it was emailed is the message log (``related=prospect``,
    ``message_type="seo_prospect.<subject>"``); the row holds the claim, and
    what only the owner knows: that they called, and what was said. See
    ``_docs/seo-prospect-outreach.md``.
    """

    class Subject(models.IntegerChoices):
        """The subject lines in ``seo/utils/prospect_sending.py``, tested against each other; some retired."""

        ONE = 1, "1: I spent 3 hours on this"
        TWO = 2, "2: N free fixes for the domain"
        THREE = 3, "3: Your ad, and what your site is missing"
        FOUR = 4, "4: A free SEO report for the business"
        FIVE = 5, "5: Not on Google's first page"
        SIX = 6, "6: A list of fixes for the domain"
        SEVEN = 7, "7: What's wrong with the domain, and how to fix it"
        EIGHT = 8, "8: Podcast affiliate offer for the podcast"

    class Purpose(models.TextChoices):
        """Why the report was written: a business we hope will buy the full one, or a podcast host we hope will join."""

        CLIENT = "client", "Client"
        AFFILIATE = "affiliate", "Affiliate"

    class Body(models.IntegerChoices):
        """The email bodies in ``seo/utils/prospect_sending.py``. A client gets one of ``CLIENT_BODIES`` (5 alone
        today; 1, 2 and 4 are paused), levelled when there is more than one; an affiliate gets 3, under subject 8."""

        REPORT = 1, "1: the report email"
        BET = 2, "2: the three-hour bet"
        AFFILIATE = 3, "3: the affiliate offer"
        LIST = 4, "4: the bet with the list"
        FIXES = 5, "5: the fixes list"

    class Reply(models.TextChoices):
        NONE = "none", "No reply"
        POSITIVE = "positive", "Positive"
        NEGATIVE = "negative", "Negative"

    # The business's own domain, the prospecting ledger's key.
    domain = models.CharField(max_length=255, unique=True)
    business = models.CharField(max_length=255)
    # The report's project in ../ftp_search/_search/projects/.
    slug = models.CharField(max_length=64, unique=True)
    report_version = models.CharField(max_length=16)
    # Where the report sits on the owner's machine, shown to copy.
    report_path = models.CharField(max_length=500)
    report_pdf = models.FileField(storage=private_prospect_report_storage, upload_to="", max_length=255)
    # The same report as a page, for the link (``/reports/<business>-<token>``, ``seo/utils/prospect_links.py``): texted during a
    # call and named in every report email beside the PDF (owner, 2026-11-04). Blank on a row uploaded before the
    # link existed; the link then serves the PDF.
    report_html = models.FileField(storage=private_prospect_report_storage, upload_to="", max_length=255, blank=True)
    # The picture a chat or text app shows beside the link (the page's og:image): the report's cover at 1200 by
    # 630, taken by render beside the PDF and uploaded with the page (owner, 2026-11-07). Blank on a row from
    # before it; the page then names the site's SEO picture instead (``prospect_links.preview_image``).
    report_cover = models.FileField(storage=private_prospect_report_storage, upload_to="", max_length=255, blank=True)
    # The unguessable part of the link (its tail, after the business's name), set once; the page is noindexed and
    # linked from nowhere else.
    link_token = models.CharField(max_length=16, unique=True, default=new_link_token)
    contact_name = models.CharField(max_length=255, blank=True)
    # Lowercased on upload. One report per address, as per business.
    email = models.EmailField(unique=True)
    # The page that publishes the address: the Spam Act's inferred-consent evidence.
    email_source = models.URLField(max_length=500, blank=True)
    phone = models.CharField(max_length=40, blank=True)
    # One line: what the business is.
    overview = models.CharField(max_length=300)
    # The report's highest-impact recommendation titles, strongest first: the first two are body 1's "two stand
    # out", the first five are body 4's list.
    issues = models.JSONField(default=list)
    # The searches its ad was seen on: subjects 3 and 5 name the first.
    paid_searches = models.JSONField(default=list)
    # The report's own count, so subject 2 agrees with it. Every report says three hours (owner, 2026-10-30).
    recommendation_count = models.PositiveSmallIntegerField()
    purpose = models.CharField(max_length=10, choices=Purpose.choices, default=Purpose.CLIENT, db_index=True)
    subject_version = models.PositiveSmallIntegerField(choices=Subject.choices, db_index=True)
    body_version = models.PositiveSmallIntegerField(choices=Body.choices, default=Body.REPORT, db_index=True)
    # Rows before 2026-10-30 carried the analyst's email, which body 1 sent as written; it is kept for them.
    # Since then every body is the server's text around the row's own fields, and this is empty.
    body = models.TextField(blank=True)
    # What the business counts, for body 2's bet: bookings, calls, quotes, sales.
    metric = models.CharField(max_length=40, default="bookings")
    # The owner's word that the report may be emailed (``POST /api/seo/prospects/approve/``). Null means held:
    # uploaded for its link and the owner's reading, and the hourly run leaves it alone.
    approved_at = models.DateTimeField(null=True, blank=True, db_index=True)
    # Set by the cron's claim before the send. Null means still queued (or held, with no approved_at).
    sent_at = models.DateTimeField(null=True, blank=True, db_index=True)
    # The one follow-up (owner, 2026-11-04): queued through ``POST /api/seo/prospects/follow-up/`` once a week has
    # passed with no call and no reply, then claimed and sent by the hourly run, like the report email.
    follow_up_queued_at = models.DateTimeField(null=True, blank=True)
    followed_up_at = models.DateTimeField(null=True, blank=True)
    # The follow-up's own subject and body, chosen when it is queued: a subject from the live rotation, not the
    # report email's, and the client body of the day (owner, 2026-11-04). Null until queued.
    follow_up_subject_version = models.PositiveSmallIntegerField(choices=Subject.choices, null=True, blank=True)
    follow_up_body_version = models.PositiveSmallIntegerField(choices=Body.choices, null=True, blank=True)
    # Set by hand on the dashboard.
    called_at = models.DateTimeField(null=True, blank=True, db_index=True)
    call_notes = models.TextField(blank=True)
    reply = models.CharField(max_length=10, choices=Reply.choices, default=Reply.NONE)
    # Blank means eligible. The cron skips anyone with one.
    excluded_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"{self.business} <{self.email}>"
