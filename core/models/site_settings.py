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
    SEO prices are per report: the customer picks monthly, quarterly or yearly
    at signup, or a one-off audit, and each has its own price.

    The rest price the website development packages and the quoted work. Work
    is billed at the hourly rate. Two website packages are each a page count at
    a per-page price, and an extra page costs the same. The web application
    package is bought as its discovery: that many hours at the hourly rate,
    paid upfront. Web applications and automation also carry a "from"
    price, the smallest project of each worth starting.
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
        max_digits=8, decimal_places=2, default=Decimal("499.00"),
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    seo_quarterly_price = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal("499.00"),
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    seo_yearly_price = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal("499.00"),
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    seo_oneoff_price = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal("550.00"),
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    hourly_rate = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal("150.00"),
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    discovery_hours = models.PositiveSmallIntegerField(
        default=3, validators=[MinValueValidator(1)],
    )
    website_small_pages = models.PositiveSmallIntegerField(
        default=6, validators=[MinValueValidator(1)],
    )
    website_small_page_price = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal("500.00"),
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    website_large_pages = models.PositiveSmallIntegerField(
        default=10, validators=[MinValueValidator(1)],
    )
    website_large_page_price = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal("600.00"),
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    web_app_from_price = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal("9000.00"),
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    automation_from_price = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal("1200.00"),
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
