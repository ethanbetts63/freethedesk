from django.db import models


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
