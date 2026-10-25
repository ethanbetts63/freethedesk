from django.conf import settings
from django.db import models


class Affiliate(models.Model):
    """A podcast host in the affiliate program, from the moment they sign up.

    Signing up on /affiliates opens the account at once: the login (verified by
    the emailed code, see ``freetheplatform.auth.codes``), the discount code
    the host's listeners type at checkout, and a complimentary Plus audit as an
    ``SeoSubscriber`` on the same login, so the host's free audit runs through
    the ordinary SEO setup and reporting. Nothing is approved by hand.

    ``discount`` is the shared payments app's code, the one Stripe charges
    against. Whose code it is lives here (and in the code's ``owner``), the
    commission it earns is ``Commission``: the package deliberately knows about
    neither.
    """

    class Status(models.TextChoices):
        """Mirrors the dealer and SEO statuses so the staff pages share one pill."""

        PENDING = "pending", "Pending"
        ACTIVE = "active", "Active"
        SUSPENDED = "suspended", "Suspended"
        DENIED = "denied", "Denied"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="affiliate"
    )
    email = models.EmailField()
    contact_name = models.CharField(max_length=120)
    #: The podcast, or the business behind it: what the code is named after.
    business_name = models.CharField(max_length=180)
    website = models.URLField(blank=True)
    discount = models.OneToOneField(
        "ftp_payments.DiscountCode",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="affiliate",
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.ACTIVE, db_index=True
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
    def code(self) -> str:
        """The code as the host was given it, or empty if it was removed."""
        return self.discount.code if self.discount is not None else ""

    @property
    def is_active(self) -> bool:
        return self.status == self.Status.ACTIVE
