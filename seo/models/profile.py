from django.db import models

from .subscriber import SeoSubscriber


class SeoProfile(models.Model):
    """The reporting inputs collected after payment activates."""

    class OnboardingStatus(models.TextChoices):
        NOT_STARTED = "not_started", "Not started"
        IN_PROGRESS = "in_progress", "In progress"
        SUBMITTED = "submitted", "Submitted"
        ACTIVE = "active", "Active"

    subscriber = models.OneToOneField(SeoSubscriber, on_delete=models.CASCADE, related_name="profile")
    onboarding_status = models.CharField(
        max_length=20,
        choices=OnboardingStatus.choices,
        default=OnboardingStatus.NOT_STARTED,
        db_index=True,
    )
    website_url = models.URLField(blank=True)
    search_console_property = models.CharField(max_length=255, blank=True)
    primary_location = models.CharField(max_length=180, blank=True)
    target_keywords = models.TextField(blank=True)
    competitors = models.TextField(blank=True)
    google_business_profile_url = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.subscriber.business_name} SEO profile"
