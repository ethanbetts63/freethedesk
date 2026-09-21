"""Identity verification, built to be replaced.

The sale gates on ``verification.is_verified`` and nothing in ``sales`` knows how
that became true. What satisfies it is a provider: today a person at the
dealership looking at three photographs, later Stripe Identity returning a
verdict. Swapping providers sets the same flag, deletes the manual state, and
nothing else in the flow moves.

**Three images with three verdicts, not one verdict over three files.** A clear
licence and an unusable selfie is the ordinary failure, and making the customer
redo all of it because one photograph was blurry is the kind of small cruelty
that gets a sale abandoned. Each image is approved or rejected on its own, and a
rejection clears that image and keeps the others.

Not a legal duty — there is no prescribed procedure for a dealer verifying a
purchaser's identity and therefore no safe harbour — which is exactly why this
goes early in the flow and why the policy is written down. See
`_docs/licensing/research/online_licensing.md` section 3.

Retention is in `_docs/licensing/retention.md`: **the images are kept.** They
are the dealer's evidence that they satisfied themselves about the person a
vehicle was licensed to, and that evidence is worth nothing if it expires
before the question does. They are also the most sensitive category either this
system or allbikes holds, which is why the storage tree is private, the view is
the whole of the access control, and the schedule says so in writing rather
than leaving it to be inferred from the absence of a deletion.
"""

from pathlib import Path
from uuid import uuid4

from django.db import models

from core.models import TenantOwned

from .storage import private_identity_storage


def identity_image_path(instance, filename: str) -> str:
    """No original filename and no personal detail in the stored key."""
    suffix = Path(filename).suffix.lower() or ".jpg"
    return f"sales/{instance.sale_id}/{uuid4().hex}{suffix}"


class Verification(TenantOwned):
    """One per sale."""

    class Provider(models.TextChoices):
        MANUAL = "manual", "Reviewed by the dealer"
        # STRIPE arrives with the swap. Named here so the column's choices do
        # not have to change in the same migration that adds its columns.
        STRIPE = "stripe", "Stripe Identity"

    class Status(models.TextChoices):
        PENDING = "pending", "Waiting for the customer"
        SUBMITTED = "submitted", "Waiting for review"
        VERIFIED = "verified", "Verified"
        REJECTED = "rejected", "Rejected"

    class ImageStatus(models.TextChoices):
        MISSING = "missing", "Not uploaded"
        SUBMITTED = "submitted", "Waiting for review"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    #: The three things a customer uploads, in the order they are asked for.
    #: Keyed by the URL segment, and used to build the per-image field names —
    #: one list rather than the same three strings written out at every call
    #: site that walks them.
    SIDES = ("front", "back", "selfie")
    SIDE_LABELS = {
        "front": "the front of your driver's licence",
        "back": "the back of your driver's licence",
        "selfie": "a photo of your face",
    }

    sale = models.OneToOneField(
        "sales.Sale", on_delete=models.CASCADE, related_name="verification"
    )
    provider = models.CharField(
        max_length=20, choices=Provider.choices, default=Provider.MANUAL
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    #: The reviewing dealer user. Null for a provider verdict, which is what it
    #: will always be after the swap.
    verified_by = models.ForeignKey(
        "auth.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="verified_sales",
    )
    #: Shown to the customer, so it has to be a sentence rather than a code.
    rejection_reason = models.TextField(blank=True)

    # --- manual-only, dropped with the provider swap ------------------------
    front_image = models.FileField(
        storage=private_identity_storage, upload_to=identity_image_path, blank=True
    )
    front_status = models.CharField(
        max_length=20, choices=ImageStatus.choices, default=ImageStatus.MISSING
    )
    front_reason = models.TextField(blank=True)

    back_image = models.FileField(
        storage=private_identity_storage, upload_to=identity_image_path, blank=True
    )
    back_status = models.CharField(
        max_length=20, choices=ImageStatus.choices, default=ImageStatus.MISSING
    )
    back_reason = models.TextField(blank=True)

    selfie_image = models.FileField(
        storage=private_identity_storage, upload_to=identity_image_path, blank=True
    )
    selfie_status = models.CharField(
        max_length=20, choices=ImageStatus.choices, default=ImageStatus.MISSING
    )
    selfie_reason = models.TextField(blank=True)

    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta(TenantOwned.Meta):
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.sale_id}: {self.status}"

    @property
    def is_verified(self) -> bool:
        """The whole of what ``sales`` knows about identity."""
        return self.status == self.Status.VERIFIED

    def image(self, side):
        return getattr(self, f"{side}_image")

    def image_status(self, side):
        return getattr(self, f"{side}_status")

    def image_reason(self, side):
        return getattr(self, f"{side}_reason")

    def all_approved(self) -> bool:
        return all(
            self.image_status(side) == self.ImageStatus.APPROVED for side in self.SIDES
        )

    def all_submitted(self) -> bool:
        """Every image present and none of them rejected.

        ``APPROVED`` counts, because a dealer who approved two images and then
        asked for the third again should not have to re-approve the two they
        have already looked at.
        """
        return all(
            self.image_status(side)
            in (self.ImageStatus.SUBMITTED, self.ImageStatus.APPROVED)
            for side in self.SIDES
        )

    def outstanding(self):
        """The images the customer still has to send, as sentences.

        Sentences rather than field names because this reaches the customer's
        screen, and "back_status: rejected" tells somebody nothing about what to
        photograph next.
        """
        pending = []
        for side in self.SIDES:
            status = self.image_status(side)
            if status == self.ImageStatus.MISSING:
                pending.append((side, f"Send {self.SIDE_LABELS[side]}."))
            elif status == self.ImageStatus.REJECTED:
                reason = self.image_reason(side) or "It could not be read."
                pending.append((side, f"Send {self.SIDE_LABELS[side]} again. {reason}"))
        return pending
