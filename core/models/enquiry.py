from django.db import models


class Enquiry(models.Model):
    class HelpWith(models.TextChoices):
        """What the enquiry is about: a project form scope, or the AI check."""

        WEBSITE = "website", "Website"
        AUTOMATION = "automation", "Business automation"
        AI_READINESS = "ai_readiness", "AI readiness check"
        EVERYTHING = "everything", "Website and automation"
        SEO = "seo", "SEO audit"
        # A podcast host signing up to the partner program on /partners.
        PARTNER = "partner", "Podcast partner"

    class Status(models.TextChoices):
        NEW = "new", "New"
        CONTACTED = "contacted", "Contacted"
        QUALIFIED = "qualified", "Qualified"
        WON = "won", "Won"
        CLOSED = "closed", "Closed"
        SPAM = "spam", "Spam"
        # Dismissed without a reply: off the new list, kept for the record.
        IGNORED = "ignored", "Ignored"

    name = models.CharField(max_length=120)
    business = models.CharField(max_length=180, blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    website = models.URLField(blank=True)
    help_with = models.CharField(max_length=20, choices=HelpWith.choices)
    message = models.TextField()
    configuration = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "enquiries"

    def __str__(self) -> str:
        return f"{self.business or self.name} — {self.get_help_with_display()}"
