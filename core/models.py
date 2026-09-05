from decimal import Decimal

from django.db import models


class LicensingSettings(models.Model):
    """Singleton holding the subscription prices shown on the licensing page.

    All prices are GST inclusive — what a dealer actually pays each month, with
    no "+ GST" added at checkout. Editable from the admin dashboard so pricing
    can change without a deploy. This drives the marketing copy only; the
    amount Stripe actually charges still comes from the STRIPE_PRICE_* env vars.
    """

    licensing_price = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal("149.00"))
    contracts_price = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal("99.00"))
    complete_price = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal("199.00"))
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Licensing settings"
        verbose_name_plural = "Licensing settings"

    def __str__(self) -> str:
        return "Licensing settings"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls) -> "LicensingSettings":
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class Enquiry(models.Model):
    class HelpWith(models.TextChoices):
        WEBSITE = "website", "Dealer website"
        WEBSITE_BUILDER = "website_builder", "Dealer web enquiry"
        INVENTORY = "inventory", "Inventory, parts, service or hire"
        AUTOMATION = "automation", "Business automation"
        EVERYTHING = "everything", "All of the above"
        UNSURE = "unsure", "Not sure yet"

    class Status(models.TextChoices):
        NEW = "new", "New"
        CONTACTED = "contacted", "Contacted"
        QUALIFIED = "qualified", "Qualified"
        WON = "won", "Won"
        CLOSED = "closed", "Closed"
        SPAM = "spam", "Spam"

    name = models.CharField(max_length=120)
    business = models.CharField(max_length=180)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    website = models.URLField(blank=True)
    help_with = models.CharField(max_length=20, choices=HelpWith.choices)
    message = models.TextField()
    configuration = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "enquiries"

    def __str__(self) -> str:
        return f"{self.business} — {self.get_help_with_display()}"


class Notification(models.Model):
    class RecipientType(models.TextChoices):
        ADMIN = "admin", "Admin"
        DEALER = "dealer", "Dealer"
        MANUAL = "manual", "Manual email"

    class Channel(models.TextChoices):
        EMAIL = "email", "Email"
        SMS = "sms", "SMS"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SENT = "sent", "Sent"
        FAILED = "failed", "Failed"

    recipient_type = models.CharField(max_length=20, choices=RecipientType.choices)
    recipient = models.CharField(max_length=254)
    channel = models.CharField(max_length=10, choices=Channel.choices)
    subject = models.CharField(max_length=255, blank=True)
    body = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    related_enquiry = models.ForeignKey(
        Enquiry,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="notifications",
    )
    # String reference so core carries no import of dealers; the dependency
    # runs dealers -> core, and Django resolves this lazily.
    related_dealer = models.ForeignKey(
        "dealers.Dealer",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="notifications",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.get_channel_display()} to {self.recipient}"
