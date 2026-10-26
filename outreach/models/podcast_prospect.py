from django.db import models


class PodcastProspect(models.Model):
    """A podcast host found by the scraper, pitched once by the hourly cron.

    Rows arrive through ``POST /api/outreach/upload/`` from the local
    ``upload_prospects`` command and are never updated by it: once a prospect
    exists, the server's row is the record. Who was emailed and what became of
    it is the message log (``related=prospect``, ``message_type=
    "podcast_pitch.<version>"``); the row holds only the three facts the log
    cannot: that the cron claimed it, what the host replied, and whether they
    signed up. See ``_docs/affiliate-outreach.md``.
    """

    class Version(models.TextChoices):
        """The three pitch templates under ``emails/podcast_pitch/``."""

        A = "a", "A"
        B = "b", "B"
        C = "c", "C"

    class Reply(models.TextChoices):
        NONE = "none", "No reply"
        POSITIVE = "positive", "Positive"
        NEGATIVE = "negative", "Negative"

    # Lowercased on upload. One pitch per address, however many shows share it.
    email = models.EmailField(unique=True)
    # The RSS feed the address was published in: the Spam Act's inferred-consent
    # evidence. Feed and listing URLs run long, hence the width.
    email_source = models.URLField(max_length=500)
    podcast_name = models.CharField(max_length=255)
    # Blank means the template says "there".
    host_name = models.CharField(max_length=255, blank=True)
    # Derived from host_name on upload when it looks like a person's name.
    first_name = models.CharField(max_length=120, blank=True)
    website = models.URLField(max_length=500, blank=True)
    apple_url = models.URLField(max_length=500, blank=True)
    genre = models.CharField(max_length=255, blank=True)
    episode_count = models.PositiveIntegerField(default=0)
    latest_episode_title = models.CharField(max_length=255, blank=True)
    latest_episode_description = models.TextField(blank=True)
    last_release_date = models.DateField(null=True, blank=True)
    # The one hand-written line. Blank sends without it.
    opener = models.TextField(blank=True)
    version = models.CharField(max_length=1, choices=Version.choices, db_index=True)
    # Set by the cron's claim before the send. Null means still queued.
    pitched_at = models.DateTimeField(null=True, blank=True, db_index=True)
    # Set by hand on the dashboard: replies land in the owner's inbox.
    reply = models.CharField(max_length=10, choices=Reply.choices, default=Reply.NONE)
    # The affiliate account that registered with this address.
    affiliate = models.ForeignKey(
        "affiliates.Affiliate",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="prospects",
    )
    # Blank means eligible. The cron skips anyone with one.
    excluded_reason = models.TextField(blank=True)
    scraped_on = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"{self.podcast_name} <{self.email}>"

    @property
    def is_excluded(self) -> bool:
        return bool(self.excluded_reason)
