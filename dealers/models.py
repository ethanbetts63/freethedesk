from pathlib import Path
from uuid import uuid4

from django.conf import settings
from django.db import models

from .storage import private_document_storage


def dealer_document_path(instance, filename: str) -> str:
    """Keep original filenames and dealer details out of stored object keys."""
    suffix = Path(filename).suffix.lower()
    return f"dealer-documents/{instance.dealer_id}/{uuid4().hex}{suffix}"


class Dealer(models.Model):
    """A dealership account.

    This is the tenant root for the licensing product: everything a dealer owns
    in later phases hangs off this row through a ``dealer`` foreign key. Signup
    deliberately collects the minimum — licence numbers, documents and
    special-condition choices all belong to the post-payment onboarding flow.
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACTIVE = "active", "Active"
        SUSPENDED = "suspended", "Suspended"
        DENIED = "denied", "Denied"

    class Plan(models.TextChoices):
        DEMO = "demo", "Try the demo"
        LICENSING = "licensing", "Online licensing"
        CONTRACTS = "contracts", "Online contracts"
        COMPLETE = "complete", "Complete online sale"

    class PaymentStatus(models.TextChoices):
        DEMO = "demo", "Demo"
        PAYMENT_PENDING = "payment_pending", "Payment pending"
        ACTIVE = "active", "Active"
        PAST_DUE = "past_due", "Past due"
        CANCELLED = "cancelled", "Cancelled"

    class State(models.TextChoices):
        WA = "WA", "Western Australia"
        NSW = "NSW", "New South Wales"
        VIC = "VIC", "Victoria"
        QLD = "QLD", "Queensland"
        SA = "SA", "South Australia"
        TAS = "TAS", "Tasmania"
        ACT = "ACT", "Australian Capital Territory"
        NT = "NT", "Northern Territory"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="dealer",
    )
    business_name = models.CharField(max_length=180)
    contact_name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    state = models.CharField(max_length=3, choices=State.choices, default=State.WA)
    plan = models.CharField(max_length=20, choices=Plan.choices, default=Plan.DEMO, db_index=True)
    payment_status = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.DEMO, db_index=True
    )
    stripe_customer_id = models.CharField(max_length=255, null=True, blank=True, unique=True)
    stripe_subscription_id = models.CharField(max_length=255, null=True, blank=True, unique=True)
    stripe_checkout_session_id = models.CharField(max_length=255, null=True, blank=True, unique=True)
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


class DealerProfile(models.Model):
    """The operational and compliance details collected after payment."""

    class VerificationStatus(models.TextChoices):
        NOT_STARTED = "not_started", "Not started"
        IN_PROGRESS = "in_progress", "In progress"
        SUBMITTED = "submitted", "Submitted"
        CHANGES_REQUESTED = "changes_requested", "Changes requested"
        VERIFIED = "verified", "Verified"
        REJECTED = "rejected", "Rejected"

    dealer = models.OneToOneField(Dealer, on_delete=models.CASCADE, related_name="profile")
    verification_status = models.CharField(
        max_length=24,
        choices=VerificationStatus.choices,
        default=VerificationStatus.NOT_STARTED,
        db_index=True,
    )

    legal_name = models.CharField(max_length=200, blank=True)
    dealer_licence_number = models.CharField(max_length=50, blank=True)
    repairer_licence_number = models.CharField(max_length=50, blank=True)
    organisation_code = models.CharField(max_length=50, blank=True)
    abn = models.CharField(max_length=20, blank=True)
    acn = models.CharField(max_length=20, blank=True)
    address_line1 = models.CharField(max_length=200, blank=True)
    suburb = models.CharField(max_length=100, blank=True)
    postcode = models.CharField(max_length=20, blank=True)

    authorised_officer_name = models.CharField(max_length=200, blank=True)
    authorised_officer_licence_number = models.CharField(max_length=50, blank=True)
    authorised_officer_date_of_birth = models.DateField(null=True, blank=True)
    declared_at = models.CharField(max_length=100, blank=True)

    dealer_licence_document = models.FileField(
        storage=private_document_storage, upload_to=dealer_document_path, blank=True
    )
    authorised_officer_identity_document = models.FileField(
        storage=private_document_storage, upload_to=dealer_document_path, blank=True
    )
    business_evidence_document = models.FileField(
        storage=private_document_storage, upload_to=dealer_document_path, blank=True
    )

    condition_choices = models.JSONField(default=dict, blank=True)
    conditions_version = models.PositiveIntegerField(default=1)
    conditions_accepted_at = models.DateTimeField(null=True, blank=True)
    conditions_accepted_ip = models.GenericIPAddressField(null=True, blank=True)
    conditions_accepted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="accepted_dealer_conditions",
    )

    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reviewed_dealer_profiles",
    )
    verification_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.dealer.business_name} profile"
