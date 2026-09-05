from django.conf import settings
from django.db import models

from dealers.models import Dealer


class DealerSubscriptionTermsAcceptance(models.Model):
    """Immutable evidence of the exact offer and terms a dealer accepted."""

    dealer = models.ForeignKey(Dealer, on_delete=models.CASCADE, related_name="subscription_acceptances")
    accepted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    plan = models.CharField(max_length=20, choices=Dealer.Plan.choices)
    monthly_price = models.DecimalField(max_digits=8, decimal_places=2)
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
                fields=[
                    "dealer", "plan", "monthly_price", "currency",
                    "terms_version", "terms_sha256",
                ],
                name="unique_dealer_subscription_offer_acceptance",
            )
        ]

    def __str__(self):
        return f"{self.dealer} accepted {self.plan} {self.terms_version}"


class StripeEvent(models.Model):
    """The durable idempotency and audit record for each Stripe webhook."""

    event_id = models.CharField(max_length=255, unique=True)
    event_type = models.CharField(max_length=100, db_index=True)
    object_id = models.CharField(max_length=255, blank=True)
    stripe_created_at = models.DateTimeField()
    outcome = models.CharField(max_length=255, blank=True)
    processed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-stripe_created_at", "-id"]

    def __str__(self):
        return f"{self.event_type}: {self.event_id}"
