from django.db import models

from .subscriber import SeoSubscriber


class SeoProfile(models.Model):
    """The brief a paid subscriber gives us, all of it optional.

    Access is tracked separately, one ``SeoSetupStep`` per tool; this is what
    the customer tells us about the business. ``search_console_property`` is
    not typed by the customer: the Search Console check writes the property it
    matched.
    """

    subscriber = models.OneToOneField(SeoSubscriber, on_delete=models.CASCADE, related_name="profile")
    website_url = models.URLField(blank=True)
    search_console_property = models.CharField(max_length=255, blank=True)
    primary_location = models.CharField(max_length=180, blank=True)
    target_keywords = models.TextField(blank=True)
    competitors = models.TextField(blank=True)
    google_business_profile_url = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.subscriber.business_name} SEO profile"
