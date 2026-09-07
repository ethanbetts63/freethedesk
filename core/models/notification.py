from django.db import models

from .enquiry import Enquiry


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
