import secrets

from django.conf import settings
from django.db import models


def new_checkout_reference() -> str:
    return secrets.token_urlsafe(24)


class SeoSubscriber(models.Model):
    """An SEO customer, from the moment they fill in the signup form.

    Signup records the details and nothing else: there is no login until
    payment lands, when ``activate_paid_subscriber`` creates or attaches one.
    So ``user`` is empty on every unpaid signup, a visitor can sign up as often
    as they like, and the unpaid rows are the list of people to follow up.
    ``checkout_reference`` is what the payment page and Stripe know the signup
    by in the meantime.

    Mirrors ``dealers.models.Dealer`` as the tenant root for the SEO product.
    The reporting inputs (Search Console property, target keywords,
    competitors) belong to the post-payment setup flow.
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACTIVE = "active", "Active"
        SUSPENDED = "suspended", "Suspended"
        DENIED = "denied", "Denied"

    class Plan(models.TextChoices):
        """How often a subscriber gets a report, or a single one-off report.

        The customer picks at signup, by how fast they can act on a report:
        monthly if changes can go in within weeks, quarterly if they go through
        an agency or an IT queue, yearly as an annual check-up. Each has its
        own price. Staff move a subscriber between them on request.
        """

        MONTHLY = "monthly", "Monthly"
        QUARTERLY = "quarterly", "Quarterly"
        YEARLY = "yearly", "Yearly"
        ONEOFF = "oneoff", "SEO audit"

    SIGNUP_PLANS = (Plan.MONTHLY, Plan.QUARTERLY, Plan.YEARLY, Plan.ONEOFF)

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
        null=True,
        blank=True,
    )
    email = models.EmailField()
    checkout_reference = models.CharField(
        max_length=64, unique=True, default=new_checkout_reference, editable=False
    )
    business_name = models.CharField(max_length=180)
    contact_name = models.CharField(max_length=120)
    phone = models.CharField(max_length=40, blank=True)
    website = models.URLField(blank=True)
    plan = models.CharField(max_length=20, choices=Plan.choices, default=Plan.MONTHLY, db_index=True)
    payment_status = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PAYMENT_PENDING, db_index=True
    )
    stripe_customer_id = models.CharField(max_length=255, null=True, blank=True, unique=True)
    stripe_subscription_id = models.CharField(max_length=255, null=True, blank=True, unique=True)
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
    def is_one_off(self) -> bool:
        return self.plan == self.Plan.ONEOFF

    @property
    def has_paid(self) -> bool:
        return self.payment_status in {self.PaymentStatus.ACTIVE, self.PaymentStatus.PAID}
