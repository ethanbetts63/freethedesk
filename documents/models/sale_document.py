"""A signed document, and the evidence about it.

**Unsigned documents are never rows.** A filled form carries a licence number
and a date of birth, so it is built on demand and streamed. Writing one to disk
creates a file nobody asked for and nothing deletes.

The signing evidence is duplicated on purpose. It also exists as a
``freetheplatform.agreements`` acceptance, which is the immutable record; these
columns sit beside the file so that the thing a dealer opens in a dispute and
the evidence about it are not in two systems.
"""

from pathlib import Path
from uuid import uuid4

from django.db import models

from core.models import TenantManager, TenantOwned

from .storage import private_document_storage


def sale_document_path(instance, filename: str) -> str:
    """No original filename and no personal detail in the stored key."""
    suffix = Path(filename).suffix.lower() or ".pdf"
    return f"sales/{instance.sale_id}/{uuid4().hex}{suffix}"


class SaleDocumentManager(TenantManager):
    """``sale.documents.all()`` raises, so this is the idiom that replaces it.

    Safe without naming a dealer because the sale it is given was itself fetched
    through ``for_dealer`` or through a customer's access cookie. The scoping has
    already happened, one level up.
    """

    def for_sale(self, sale):
        return self._unscoped().filter(sale=sale)


class SaleDocument(TenantOwned):
    class Kind(models.TextChoices):
        SALE_CONTRACT = "sale_contract", "Vehicle Sale Contract"
        LICENSING_FORM = "licensing_form", "Licensing form"
        AUTHORITY_TO_LODGE = "authority_to_lodge", "Authority to Lodge"

    class SignedBy(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        DEALER = "dealer", "Dealer"

    sale = models.ForeignKey("sales.Sale", on_delete=models.CASCADE, related_name="documents")
    kind = models.CharField(max_length=32, choices=Kind.choices)
    file = models.FileField(storage=private_document_storage, upload_to=sale_document_path)
    #: Which published version of a prescribed form this was built from. Null
    #: for the contract and the Authority to Lodge, which have no template.
    template_version = models.CharField(max_length=32, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    # --- the signature record -----------------------------------------------
    signer_name = models.CharField(max_length=200, blank=True)
    signed_at = models.DateTimeField(null=True, blank=True)
    #: The declaration exactly as it was shown. Stored verbatim because the
    #: claim this supports is that *this* wording was agreed to, and a key
    #: pointing at wording that can be edited later supports nothing.
    signing_statement = models.TextField(blank=True)
    document_sha256 = models.CharField(max_length=64, blank=True)
    signing_ip_address = models.GenericIPAddressField(null=True, blank=True)
    signing_user_agent = models.CharField(max_length=500, blank=True)
    signed_by_role = models.CharField(max_length=20, choices=SignedBy.choices, blank=True)

    objects = SaleDocumentManager()
    all_objects = models.Manager()

    class Meta(TenantOwned.Meta):
        ordering = ["kind"]
        constraints = [
            models.UniqueConstraint(
                fields=["sale", "kind"], name="sale_document_kind_unique"
            ),
        ]

    def __str__(self) -> str:
        return f"{self.sale_id}: {self.kind}"

    @property
    def is_stale(self) -> bool:
        """Whether the sale has moved on since this was signed.

        Derived, never stored. A flag can fall out of step with the edit that
        set it; a comparison cannot. A stale document is shown as stale to both
        parties rather than hidden — the dealer needs to know it exists and why
        it no longer counts, and the customer needs to be sent back to sign
        rather than left thinking they are finished.
        """
        changed = self.sale.details_updated_at
        return bool(changed and self.uploaded_at and changed > self.uploaded_at)
