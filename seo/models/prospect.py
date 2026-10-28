from django.db import models

from .storage import private_prospect_report_storage


class SeoProspect(models.Model):
    """A business sent a free prospect SEO report, and the call that follows it.

    Rows arrive through ``POST /api/seo/prospects/`` from the report pipeline
    (``../ftp_search``, ``_search/tools/prospecting/send.py``) once a report is
    published, and are never updated by it: one report per business. The
    hourly ``send_affiliate_outreach`` run emails each in Perth business hours.
    Whether and when it was emailed is the message log (``related=prospect``,
    ``message_type="seo_prospect.<subject>"``); the row holds the claim, and
    what only the owner knows: that they called, and what was said. See
    ``_docs/seo-prospect-outreach.md``.
    """

    class Subject(models.IntegerChoices):
        """The five subject lines in ``seo/utils/prospect_sending.py``, tested against each other."""

        ONE = 1, "1: I spent N hours on this"
        TWO = 2, "2: N free fixes for the domain"
        THREE = 3, "3: Your ad, and what your site is missing"
        FOUR = 4, "4: A free SEO report for the business"
        FIVE = 5, "5: Not on Google's first page"

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
    contact_name = models.CharField(max_length=255, blank=True)
    # Lowercased on upload. One report per address, as per business.
    email = models.EmailField(unique=True)
    # The page that publishes the address: the Spam Act's inferred-consent evidence.
    email_source = models.URLField(max_length=500, blank=True)
    phone = models.CharField(max_length=40, blank=True)
    # One line: what the business is.
    overview = models.CharField(max_length=300)
    # The report's strongest findings, a few short lines.
    issues = models.JSONField(default=list)
    # The searches its ad was seen on: subjects 3 and 5 name the first.
    paid_searches = models.JSONField(default=list)
    # The report's own figures, so subjects 1 and 2 agree with it.
    hours = models.PositiveSmallIntegerField()
    recommendation_count = models.PositiveSmallIntegerField()
    subject_version = models.PositiveSmallIntegerField(choices=Subject.choices, db_index=True)
    # The analyst's email body, signature included.
    body = models.TextField()
    # Set by the cron's claim before the send. Null means still queued.
    sent_at = models.DateTimeField(null=True, blank=True, db_index=True)
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
