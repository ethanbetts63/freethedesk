from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models


class SiteSettings(models.Model):
    """Singleton holding the prices shown on the public site.

    A price here is the total a customer pays, with nothing added at
    checkout. The entity taking these payments is not registered for GST, so
    no part of a price is tax and nothing may describe it as containing any —
    see _docs/stripe-subscriptions.md. Editable from the admin dashboard so pricing
    can change without a deploy.

    Licensing prices are per month and are the source of truth sent to Stripe
    for new subscriptions; existing subscriptions retain their accepted price.
    SEO report prices are per report at each cadence. The Google Business
    Profile report has its own per-report price and can be purchased alone or
    combined with an SEO report at the selected cadence.
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
    # Per cycle, at whatever cadence the subscriber is on: a subscription
    # starts monthly and slows, and the price of each cycle does not change.
    seo_subscription_price = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal("499.00"),
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    seo_oneoff_price = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal("550.00"),
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
