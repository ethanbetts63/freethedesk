from urllib.parse import urlsplit

from django.db import models


class SeoCallRequest(models.Model):
    """A request from the site for us to get back to a business: an email or phone number, and optionally its website and a note.

    It replaced the timed booking on 2026-11-15. The owner said: "number, url optional, and optional
    notes section and we'll get back to them asap", then "lets do email or phone". Nothing is sent to
    the business. The owner is emailed and texted at once (``seo.utils.call_requests``).
    """

    class Status(models.TextChoices):
        NEW = "new", "New"
        CALLED = "called", "Called"
        NO_ANSWER = "no_answer", "No answer"
        CLOSED = "closed", "Closed"

    # An email address or a phone number, whichever they gave.
    contact = models.CharField(max_length=150)
    website = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    # The page the request came from, for measuring the call as an offer.
    source = models.CharField(max_length=64, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.NEW, db_index=True)
    prospect = models.ForeignKey(
        "seo.SeoProspect", null=True, blank=True, on_delete=models.SET_NULL, related_name="call_requests",
    )
    # The owner's own notes from the call.
    call_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.site} — {self.created_at:%Y-%m-%d %H:%M}"

    @property
    def site(self) -> str:
        """The website's host, which names the business, or the contact when no website was given."""
        if not self.website:
            return self.contact
        return (urlsplit(self.website).hostname or self.website).removeprefix("www.")
