from django.db import models

from .prospect import SeoProspect
from .sample_report import SeoSampleReport


class ReportOpen(models.Model):
    """One open of a report's link, or one step on from it: when, of what (``kind``), where the link came from
    (``source``) and whether it looks like a person or a link preview. The first engagement signal the outreach has
    (owner, 2026-11-04). No address is kept: the user agent alone says whether it was a preview fetch, which is all
    the counts need to tell people from bots.

    A prospect report and a sample's companion report log the same way (owner, 2026-11-23): one row each time, by
    ``report_opens.record_open``, counted only from the email's send on (``report_opens.counted``).
    """

    class Kind(models.TextChoices):
        PAGE = "page", "The page"
        # The PDF behind the page's link, until prospect reports stopped having one (owner, 2026-11-12); kept for
        # the opens recorded before.
        PDF = "pdf", "The PDF"
        # A click from a prospect report on to the SEO page, through ``/reports/<key>/seo``.
        SEO = "seo", "On to the SEO page"
        # A visit to a sample's redesign on the samples site, reported by the counter its pages carry.
        DEMO = "demo", "The redesign"

    opened_at = models.DateTimeField(auto_now_add=True, db_index=True)
    kind = models.CharField(max_length=8, choices=Kind.choices, default=Kind.PAGE)
    # ``?s=`` on the link: email, follow-up, text, dashboard; blank when the link carried none. For a click on to the
    # SEO page, where it was: bar, report or ask. For a visit to a redesign, also ``report``: the report's own button.
    source = models.CharField(max_length=20, blank=True)
    user_agent = models.CharField(max_length=300, blank=True)
    # A crawler, a messaging app's link preview, or no user agent at all.
    likely_bot = models.BooleanField(default=False)

    class Meta:
        abstract = True
        ordering = ["-opened_at"]


class SeoProspectOpen(ReportOpen):
    """An open of a prospect report's link (``/reports/<business>-<token>``), or a click from it on to the SEO page
    (``kind`` ``seo``; owner, 2026-11-14)."""

    prospect = models.ForeignKey(SeoProspect, on_delete=models.CASCADE, related_name="opens")

    def __str__(self) -> str:
        return f"{self.prospect.slug} {self.kind} {self.opened_at:%Y-%m-%d %H:%M}"


class SeoSampleOpen(ReportOpen):
    """An open of a sample's companion report (the same address as a prospect report's), or a visit to its redesign
    on the samples site (``kind`` ``demo``)."""

    sample = models.ForeignKey(SeoSampleReport, on_delete=models.CASCADE, related_name="opens")

    def __str__(self) -> str:
        return f"{self.sample.project} {self.kind} {self.opened_at:%Y-%m-%d %H:%M}"
