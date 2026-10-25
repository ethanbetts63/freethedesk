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
        """Which report the customer bought.

        One report, bought once, in three tiers by what it reads: Essentials
        the public data and Search Console, Plus the Business Profile and
        analytics as well, Complete everything, with a second look three
        months on. The subscriptions and the one-off audit sold before
        24 October 2026 stay so their rows and renewals still mean something;
        they are no longer sold.
        """

        ESSENTIALS = "essentials", "Essentials SEO audit"
        PLUS = "plus", "Plus SEO audit"
        COMPLETE = "complete", "Complete SEO audit"
        MONTHLY = "monthly", "Monthly subscription (retired)"
        QUARTERLY = "quarterly", "Quarterly subscription (retired)"
        YEARLY = "yearly", "Yearly subscription (retired)"
        ONEOFF = "oneoff", "One-off audit (retired)"

    SIGNUP_PLANS = (Plan.ESSENTIALS, Plan.PLUS, Plan.COMPLETE)

    class PaymentStatus(models.TextChoices):
        PAYMENT_PENDING = "payment_pending", "Payment pending"
        ACTIVE = "active", "Active"
        PAST_DUE = "past_due", "Past due"
        CANCELLED = "cancelled", "Cancelled"
        PAID = "paid", "Paid"
        # Nothing to pay: an affiliate's free audit (see ``affiliates``). Counts
        # as paid everywhere access is decided, and never as revenue.
        COMPLIMENTARY = "complimentary", "Complimentary"

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
    #: An affiliate's code typed on the signup form, as typed. Checkout passes it
    #: to the shared payments app, which re-validates it and applies the coupon.
    discount_code = models.CharField(max_length=60, blank=True)
    plan = models.CharField(max_length=20, choices=Plan.choices, default=Plan.ESSENTIALS, db_index=True)
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
    def has_paid(self) -> bool:
        return self.payment_status in {
            self.PaymentStatus.ACTIVE, self.PaymentStatus.PAID, self.PaymentStatus.COMPLIMENTARY,
        }
