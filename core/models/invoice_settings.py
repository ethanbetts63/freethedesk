from django.db import models


class InvoiceSettings(models.Model):
    """Singleton holding who our invoices are from and how to pay them.

    Separate from ``SiteSettings`` because that singleton is served to every
    visitor by the public prices endpoint; bank details must never ride along
    with it. Read by ``core/invoicing.py`` as the seller for
    ``freetheplatform.invoicing``, and snapshotted onto each invoice when it is
    issued, so changing a detail here never alters an invoice already sent.

    No GST fields: the entity invoicing is not registered for GST, so an
    invoice mentions none (``_docs/stripe-subscriptions.md``).
    """

    business_name = models.CharField(max_length=180, default="freethedesk")
    legal_name = models.CharField(
        max_length=180, blank=True,
        help_text="The legal entity, if it differs from the business name. Printed in the header and footer.",
    )
    abn = models.CharField(max_length=32, blank=True, default="11 493 753 896", verbose_name="ABN")
    address = models.TextField(blank=True, default="Perth, Western Australia", help_text="One line per printed line.")
    email = models.EmailField(max_length=150, blank=True, default="hello@freethedesk.com.au")
    phone = models.CharField(max_length=40, blank=True)
    website = models.CharField(max_length=200, blank=True, default="freethedesk.com.au")

    bank_account_name = models.CharField(max_length=180, blank=True)
    bank_bsb = models.CharField(max_length=7, blank=True, verbose_name="BSB")
    bank_account_number = models.CharField(max_length=20, blank=True)
    payment_note = models.CharField(
        max_length=255, blank=True,
        help_text="Printed under the bank details, e.g. another way to pay.",
    )

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Invoice settings"
        verbose_name_plural = "Invoice settings"

    def __str__(self) -> str:
        return "Invoice settings"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls) -> "InvoiceSettings":
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
