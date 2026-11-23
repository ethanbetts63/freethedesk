from django.db import models
from django.db.models import Q

from .prospect import new_link_token
from .storage import private_prospect_report_storage


class SeoSampleReport(models.Model):
    """A sample's companion report: what a concept redesign of a business's website changed, and why.

    The demo itself is a static site at ``samples.freethedesk.com.au/<demo>/``; its report lives here, at the same
    kind of link as a prospect report, ``/reports/<business>-<token>`` (owner, 2026-11-18), so every report freethedesk
    sends reads as one of its own pages. Rows arrive through ``POST /api/seo/samples/`` from the sample pipeline
    (``../ftp_search``, ``_samples/tools/publish/publish.py``) each time the demos are published; a project already
    here has its page replaced and keeps its link.

    The sample email (owner, 2026-11-19) rides on the same row: ``POST /api/seo/samples/hold/`` puts the contact and
    the report's first four change titles on it, held (``held_at``); ``POST /api/seo/samples/approve/`` records the
    owner's word (``approved_at``); only then does the hourly ``send_affiliate_outreach`` run email the link, once.
    A row never held (Support Perth's samples) is never emailed. See ``_docs/sample-outreach.md``.
    """

    # The sample's project in ../ftp_search/_search/projects/, the row's key.
    project = models.CharField(max_length=64, unique=True)
    business = models.CharField(max_length=255)
    # The business's own domain, as the email's subject names it ("A redesign of {domain}").
    domain = models.CharField(max_length=255, blank=True)
    # The hosted demo the report links to and the page's button opens.
    demo_url = models.URLField(max_length=500)
    report_html = models.FileField(storage=private_prospect_report_storage, upload_to="", max_length=255)
    # The page's SHA-256 as last uploaded: approval names it, so what goes out is what the owner read.
    page_sha256 = models.CharField(max_length=64, blank=True)
    # The unguessable tail of the link, set once and kept when the page is replaced.
    link_token = models.CharField(max_length=16, unique=True, default=new_link_token)
    # Who opened the link, and who visited the redesign: ``SeoSampleOpen`` rows (``opens``), logged and counted as a
    # prospect report's are (``report_opens``).

    # The email, from the pipeline's hold: whom it goes to, from what the business publishes (never made up).
    contact_name = models.CharField(max_length=255, blank=True)
    first_name = models.CharField(max_length=60, blank=True)
    # Lowercased on hold. One email per address, as per business; blank on a row never held.
    email = models.EmailField(blank=True)
    # The page that publishes the address: the Spam Act's inferred-consent evidence.
    email_source = models.CharField(max_length=500, blank=True)
    phone = models.CharField(max_length=40, blank=True)
    # The report's first four change cards' titles, in the order the report shows them; the email lists them.
    titles = models.JSONField(default=list, blank=True)
    # Put in the outbox, held for the owner's word. Null: not for email (a Support Perth sample, or not yet held).
    held_at = models.DateTimeField(null=True, blank=True)
    # The owner's word that it may be emailed. Null means held.
    approved_at = models.DateTimeField(null=True, blank=True, db_index=True)
    # Set by the hourly run's claim before the send.
    sent_at = models.DateTimeField(null=True, blank=True, db_index=True)
    # The follow-up, on the owner's word only: queued through ``POST /api/seo/samples/follow-up/``, then claimed and
    # sent by the hourly run.
    follow_up_queued_at = models.DateTimeField(null=True, blank=True)
    followed_up_at = models.DateTimeField(null=True, blank=True)
    # Blank means eligible. Set by hand to hold one back.
    excluded_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]
        constraints = [
            # One sample email per address; rows never held have none.
            models.UniqueConstraint(fields=["email"], condition=~Q(email=""), name="seo_sample_unique_email"),
        ]

    def __str__(self) -> str:
        return f"{self.business} (sample)"
