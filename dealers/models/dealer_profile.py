from django.conf import settings
from django.db import models

from . import dealer_document_path
from ..utils.storage import private_document_storage
from .dealer import Dealer


class DealerProfile(models.Model):
    """The operational and compliance details collected after payment."""

    class OnboardingStatus(models.TextChoices):
        NOT_STARTED = "not_started", "Not started"
        IN_PROGRESS = "in_progress", "In progress"
        SUBMITTED = "submitted", "Submitted"

    dealer = models.OneToOneField(Dealer, on_delete=models.CASCADE, related_name="profile")
    # Customer's own form progress, matching SeoProfile; approval is Dealer.status.
    onboarding_status = models.CharField(
        max_length=20,
        choices=OnboardingStatus.choices,
        default=OnboardingStatus.NOT_STARTED,
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

    # Where the customer is told to send the balance. Shown on the payment
    # instructions page and nowhere else. FreeTheDesk never sees the money.
    bank_account_name = models.CharField(max_length=200, blank=True)
    bank_bsb = models.CharField(max_length=7, blank=True)
    bank_account_number = models.CharField(max_length=20, blank=True)

    # How the dealer's block on an executed contract is drawn. The name alone is
    # sufficient — the image only changes what the signature looks like, not
    # whether the contract is signed.
    signature_image = models.FileField(
        storage=private_document_storage, upload_to=dealer_document_path, blank=True
    )
    signature_name = models.CharField(max_length=200, blank=True)

    # Free text shown to a customer at the end of a sale. Not parsed, not a
    # schedule: a dealer's hours are a sentence, and modelling them would mean
    # modelling public holidays and a Saturday morning nobody asked us to.
    trading_hours_note = models.TextField(blank=True)

    # The dealer's current Special Conditions: which defaults they keep, and
    # anything they have added. Current state only — the dated history of what
    # was removed, when and by whom is the sequence of agreements acceptances
    # against `dealer.special_conditions`, which is immutable and already
    # carries actor, time, address and a context snapshot. Keeping history here
    # as well would give two answers to one question.
    #
    # Replaces `conditions_version` / `conditions_accepted_at` /
    # `conditions_accepted_ip` / `conditions_accepted_by`, which were a
    # hand-rolled version of what the agreements package publishes and were
    # never written to.
    condition_choices = models.JSONField(default=dict, blank=True)

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
