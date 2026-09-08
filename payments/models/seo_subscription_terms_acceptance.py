from django.conf import settings
from django.db import models

from seo.models import SeoSubscriber


class SeoSubscriptionTermsAcceptance(models.Model):
    """Immutable evidence of the exact offer and terms an SEO customer accepted."""

    subscriber = models.ForeignKey(
        SeoSubscriber, on_delete=models.CASCADE, related_name="subscription_acceptances"
    )
    accepted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    plan = models.CharField(max_length=20, choices=SeoSubscriber.Plan.choices)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    currency = models.CharField(max_length=3, default="AUD")
    terms_version = models.CharField(max_length=30)
    terms_sha256 = models.CharField(max_length=64)
    accepted_ip = models.GenericIPAddressField(null=True, blank=True)
    accepted_at = models.DateTimeField(auto_now_add=True)
    stripe_checkout_session_id = models.CharField(max_length=255, blank=True, db_index=True)

    class Meta:
        ordering = ["-accepted_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["subscriber", "plan", "price", "currency", "terms_version", "terms_sha256"],
                name="unique_seo_subscription_offer_acceptance",
            )
        ]

    def __str__(self):
        return f"{self.subscriber} accepted {self.plan} {self.terms_version}"
