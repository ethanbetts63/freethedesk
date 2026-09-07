from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models


class SiteSettings(models.Model):
    """Singleton holding the prices shown on the public site.

    All prices are GST inclusive — what a customer actually pays, with no
    "+ GST" added at checkout. Editable from the admin dashboard so pricing
    can change without a deploy.

    Licensing prices are per month and are the source of truth sent to Stripe
    for new subscriptions; existing subscriptions retain their accepted price.
    SEO report prices are per report at each cadence. The Google Business
    Profile audit and AI readiness check are one-offs included free with every
    SEO report plan.
    """

    licensing_price = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal("149.00"),
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    contracts_price = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal("99.00"),
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    complete_price = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal("199.00"),
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    seo_monthly_price = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal("99.00"),
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    seo_quarterly_price = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal("150.00"),
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    seo_biannual_price = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal("200.00"),
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    seo_oneoff_price = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal("250.00"),
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    gbp_audit_price = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal("100.00"),
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    ai_readiness_audit_price = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal("50.00"),
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Site settings"
        verbose_name_plural = "Site settings"

    def __str__(self) -> str:
        return "Site settings"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls) -> "SiteSettings":
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
