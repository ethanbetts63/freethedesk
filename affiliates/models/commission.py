from django.db import models
from django.db.models import Q


class Commission(models.Model):
    """What one paid audit earned the affiliate whose code bought it.

    One per payment, made inside the payment webhook's transaction when the
    audit is paid, so it exists only for money that arrived. The amounts are
    snapshots: the price the audit sold for and the share it earned, as
    both stood on the day. Nothing recomputes them when the prices or the share
    change afterwards.

    Owed until it is paid out. Paying out is not built yet: when it is, a paid
    commission records the Stripe transfer that settled it, and nothing here
    has to move. A refund voids an owed commission and leaves a paid one alone
    for staff to settle by hand.
    """

    class Status(models.TextChoices):
        OWED = "owed", "Owed"
        PAID = "paid", "Paid"
        VOID = "void", "Void"

    affiliate = models.ForeignKey(
        "affiliates.Affiliate", on_delete=models.PROTECT, related_name="commissions"
    )
    # PROTECT: a commission explains a payout, and a payout is money that left.
    payment = models.OneToOneField(
        "ftp_payments.Payment", on_delete=models.PROTECT, related_name="affiliate_commission"
    )
    #: The audit, as the customer bought it: "Plus SEO audit".
    description = models.CharField(max_length=120)
    #: What the listener paid for the audit, after their discount. The share
    #: is half of this, which is what the affiliate page promises.
    sale_amount = models.DecimalField(max_digits=12, decimal_places=2)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="aud")
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.OWED, db_index=True
    )
    note = models.TextField(blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    voided_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                condition=Q(amount__gte=0) & Q(sale_amount__gte=0),
                name="affiliates_commission_amounts_not_negative",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.affiliate.business_name}: {self.amount} {self.currency.upper()} ({self.get_status_display()})"

    def save(self, *args, **kwargs):
        self.currency = (self.currency or "aud").lower()
        return super().save(*args, **kwargs)
