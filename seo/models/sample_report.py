from django.db import models

from .prospect import new_link_token
from .storage import private_prospect_report_storage


class SeoSampleReport(models.Model):
    """A sample's companion report: what a concept redesign of a business's website changed, and why.

    The demo itself is a static site at ``samples.freethedesk.com.au/<demo>/``; its report lives here, at the same
    kind of link as a prospect report, ``/reports/<business>-<token>`` (owner, 2026-11-18), so every report freethedesk
    sends reads as one of its own pages. Rows arrive through ``POST /api/seo/samples/`` from the sample pipeline
    (``../ftp_search``, ``_samples/tools/publish/publish.py``) each time the demos are published; a project already
    here has its page replaced and keeps its link. Nothing is emailed from here: the link is sent by hand.
    """

    # The sample's project in ../ftp_search/_search/projects/, the row's key.
    project = models.CharField(max_length=64, unique=True)
    business = models.CharField(max_length=255)
    # The business's own site, as the report names it.
    domain = models.CharField(max_length=255, blank=True)
    # The hosted demo the report links to and the page's button opens.
    demo_url = models.URLField(max_length=500)
    report_html = models.FileField(storage=private_prospect_report_storage, upload_to="", max_length=255)
    # The unguessable tail of the link, set once and kept when the page is replaced.
    link_token = models.CharField(max_length=16, unique=True, default=new_link_token)
    # People who opened the link, the owner signed in and link previews left out.
    opens = models.PositiveIntegerField(default=0)
    last_opened_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"{self.business} (sample)"
