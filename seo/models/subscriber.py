from django.conf import settings
from django.db import models


class SeoSubscriber(models.Model):
    """An SEO reporting customer account.

    Mirrors ``dealers.models.Dealer`` as the tenant root for the SEO product.
    Signup collects the minimum; the reporting inputs (Search Console property,
    target keywords, competitors) belong to the post-payment onboarding flow.
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACTIVE = "active", "Active"
        SUSPENDED = "suspended", "Suspended"
        DENIED = "denied", "Denied"

    class Plan(models.TextChoices):
        MONTHLY = "monthly", "Monthly report"
        QUARTERLY = "quarterly", "Quarterly report"
        BIANNUAL = "biannual", "Bi-annual report"
        ONEOFF = "oneoff", "One-off report"

    class PaymentStatus(models.TextChoices):
        PAYMENT_PENDING = "payment_pending", "Payment pending"
        ACTIVE = "active", "Active"
        PAST_DUE = "past_due", "Past due"
        CANCELLED = "cancelled", "Cancelled"
        PAID = "paid", "Paid"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="seo_subscriber",
    )
    business_name = models.CharField(max_length=180)
    contact_name = models.CharField(max_length=120)
    phone = models.CharField(max_length=40, blank=True)
    website = models.URLField(blank=True)
    plan = models.CharField(max_length=20, choices=Plan.choices, default=Plan.QUARTERLY, db_index=True)
    payment_status = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PAYMENT_PENDING, db_index=True
    )
    stripe_customer_id = models.CharField(max_length=255, null=True, blank=True, unique=True)
    stripe_subscription_id = models.CharField(max_length=255, null=True, blank=True, unique=True)
    stripe_checkout_session_id = models.CharField(max_length=255, null=True, blank=True, unique=True)
    stripe_payment_intent_id = models.CharField(max_length=255, null=True, blank=True, unique=True)
    stripe_last_event_created_at = models.DateTimeField(null=True, blank=True)
    subscription_current_period_end = models.DateTimeField(null=True, blank=True)
    cancel_at_period_end = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True
    )
    staff_notes = models.TextField(blank=True)
    status_changed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.business_name} ({self.get_status_display()})"

    @property
    def is_active(self) -> bool:
        return self.status == self.Status.ACTIVE

    @property
    def is_one_off(self) -> bool:
        return self.plan == self.Plan.ONEOFF

    @property
    def has_paid(self) -> bool:
        return self.payment_status in {self.PaymentStatus.ACTIVE, self.PaymentStatus.PAID}
