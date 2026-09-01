from django.conf import settings
from django.db import models


class Dealer(models.Model):
    """A dealership account.

    This is the tenant root for the licensing product: everything a dealer owns
    in later phases hangs off this row through a ``dealer`` foreign key. Signup
    deliberately collects the minimum — licence numbers, Dealer Online status,
    bank details and the special-conditions approval all belong to the
    onboarding wizard, behind approval.
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACTIVE = "active", "Active"
        SUSPENDED = "suspended", "Suspended"
        DENIED = "denied", "Denied"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="dealer",
    )
    business_name = models.CharField(max_length=180)
    contact_name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
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
