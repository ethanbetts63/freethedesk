import django.core.validators
from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):
    """One price per SEO plan.

    The subscription price was per cycle at any cadence; it becomes the monthly
    price, and quarterly and yearly get their own. Both start at the monthly
    price until staff set them in the admin.
    """

    dependencies = [
        ("core", "0015_seo_launch_prices"),
    ]

    operations = [
        migrations.RenameField(
            model_name="sitesettings",
            old_name="seo_subscription_price",
            new_name="seo_monthly_price",
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="seo_quarterly_price",
            field=models.DecimalField(
                decimal_places=2, default=Decimal("499.00"), max_digits=8,
                validators=[django.core.validators.MinValueValidator(Decimal("0.01"))],
            ),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="seo_yearly_price",
            field=models.DecimalField(
                decimal_places=2, default=Decimal("499.00"), max_digits=8,
                validators=[django.core.validators.MinValueValidator(Decimal("0.01"))],
            ),
        ),
    ]
