from django.db import models


class Enquiry(models.Model):
    class HelpWith(models.TextChoices):
        WEBSITE = "website", "Dealer website"
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
