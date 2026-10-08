import secrets
from decimal import Decimal

from django.db import models


def new_checkout_reference() -> str:
    return secrets.token_urlsafe(24)


class PackageOrder(models.Model):
    """A website package or discovery bought from a service page.

    The order form makes the row, with the price and the share due now read
    from the admin's settings at that moment; the browser never sets either.
    Nobody signs in to buy, so ``checkout_reference`` is what the payment page,
    Stripe and the confirmation page know the order by. Payment of ``due_now``
    is taken through Stripe; a website's balance is invoiced before launch
    (see the web development terms and ``core/invoicing.py``).
    """

    class Package(models.TextChoices):
        WEBSITE_SMALL = "website_small", "Website package 1"
        WEBSITE_LARGE = "website_large", "Website package 2"
        WEB_APPLICATION = "web_application", "Web application discovery"
        AUTOMATION_DISCOVERY = "automation_discovery", "Automation discovery"

    class PaymentStatus(models.TextChoices):
        PAYMENT_PENDING = "payment_pending", "Payment pending"
        PAID = "paid", "Paid"

    checkout_reference = models.CharField(
        max_length=64, unique=True, default=new_checkout_reference, editable=False
    )
    package = models.CharField(max_length=40, choices=Package.choices)
    #: The name the customer saw, e.g. "10-page website"; the page count is the
    #: admin's and can change after the sale.
    package_name = models.CharField(max_length=120)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    due_now = models.DecimalField(max_digits=10, decimal_places=2)
    email = models.EmailField(max_length=150)
    phone = models.CharField(max_length=40, blank=True)
    website = models.URLField(blank=True)
    business_name = models.CharField(max_length=180, blank=True)
    notes = models.TextField(blank=True)
    payment_status = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PAYMENT_PENDING
    )
    paid_at = models.DateTimeField(null=True, blank=True)
    stripe_customer_id = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.package_name} — {self.business_name or self.email}"

    @property
    def has_paid(self) -> bool:
        return self.payment_status == self.PaymentStatus.PAID

    @property
    def balance(self) -> Decimal:
        """What is still owed after the upfront payment: a website's second half."""
        return self.price - self.due_now
