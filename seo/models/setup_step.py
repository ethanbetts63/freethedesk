from django.db import models

from .subscriber import SeoSubscriber


class SeoSetupStep(models.Model):
    """One piece of access a paid subscriber grants us, and how far it has got.

    The customer can only ever say a step is done. Confirmed comes from us:
    either an automatic check that the access really works (Search Console,
    Analytics) or staff after seeing the invite arrive. A self-reported tick is
    not enough to build a report on, because the usual failure is the wrong
    address, role or property, and the customer cannot see that.

    Search Console is the only step reporting needs; ``utils.setup`` holds which
    steps exist and what each one requires.
    """

    class Key(models.TextChoices):
        SEARCH_CONSOLE = "search_console", "Google Search Console"
        GOOGLE_ANALYTICS = "google_analytics", "Google Analytics"
        BUSINESS_PROFILE = "business_profile", "Google Business Profile"
        GOOGLE_ADS = "google_ads", "Google Ads"
        CLARITY = "clarity", "Microsoft Clarity"
        ENQUIRIES = "enquiries", "Your enquiries"

    class State(models.TextChoices):
        NOT_STARTED = "not_started", "Not started"
        MARKED_DONE = "marked_done", "Marked done"
        CONFIRMED = "confirmed", "Confirmed"

    subscriber = models.ForeignKey(SeoSubscriber, on_delete=models.CASCADE, related_name="setup_steps")
    key = models.CharField(max_length=32, choices=Key.choices)
    state = models.CharField(max_length=20, choices=State.choices, default=State.NOT_STARTED)
    # What a confirmation found, e.g. the Search Console property it matched.
    detail = models.CharField(max_length=255, blank=True)
    marked_done_at = models.DateTimeField(null=True, blank=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["subscriber", "key"], name="seo_setup_step_unique_key"),
        ]

    def __str__(self) -> str:
        return f"{self.subscriber.business_name}: {self.get_key_display()} ({self.get_state_display()})"
