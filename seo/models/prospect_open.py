from django.db import models

from .prospect import SeoProspect


class SeoProspectOpen(models.Model):
    """One open of a prospect report's link (``/r/<token>``), the page or its PDF: when, where the link came from
    (the report email, the follow-up, a text, the dashboard) and whether it looks like a person or a link preview.
    The first engagement signal the outreach has (owner, 2026-11-04). No address is kept: the user agent alone
    says whether it was a preview fetch, which is all the dashboard needs to count people apart from bots."""

    class Kind(models.TextChoices):
        PAGE = "page", "The page"
        PDF = "pdf", "The PDF"

    prospect = models.ForeignKey(SeoProspect, on_delete=models.CASCADE, related_name="opens")
    opened_at = models.DateTimeField(auto_now_add=True, db_index=True)
    kind = models.CharField(max_length=8, choices=Kind.choices, default=Kind.PAGE)
    # ``?s=`` on the link: email, follow-up, text, dashboard; blank when the link carried none.
    source = models.CharField(max_length=20, blank=True)
    user_agent = models.CharField(max_length=300, blank=True)
    # A crawler, a messaging app's link preview, or no user agent at all.
    likely_bot = models.BooleanField(default=False)

    class Meta:
        ordering = ["-opened_at"]

    def __str__(self) -> str:
        return f"{self.prospect.slug} {self.kind} {self.opened_at:%Y-%m-%d %H:%M}"
