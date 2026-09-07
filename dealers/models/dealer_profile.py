from django.conf import settings
from django.db import models

from . import dealer_document_path
from ..utils.storage import private_document_storage
from .dealer import Dealer


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
