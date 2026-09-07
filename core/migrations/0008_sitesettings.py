from decimal import Decimal

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0007_alter_licensingsettings_complete_price_and_more"),
    ]

    operations = [
        migrations.RenameModel(old_name="LicensingSettings", new_name="SiteSettings"),
        migrations.AlterModelOptions(
            name="sitesettings",
            options={"verbose_name": "Site settings", "verbose_name_plural": "Site settings"},
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="seo_monthly_price",
            field=models.DecimalField(
                decimal_places=2, default=Decimal("99.00"), max_digits=8,
                validators=[django.core.validators.MinValueValidator(Decimal("0.01"))],
            ),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="seo_quarterly_price",
            field=models.DecimalField(
                decimal_places=2, default=Decimal("150.00"), max_digits=8,
                validators=[django.core.validators.MinValueValidator(Decimal("0.01"))],
            ),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="seo_biannual_price",
            field=models.DecimalField(
                decimal_places=2, default=Decimal("200.00"), max_digits=8,
                validators=[django.core.validators.MinValueValidator(Decimal("0.01"))],
            ),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="seo_oneoff_price",
            field=models.DecimalField(
                decimal_places=2, default=Decimal("250.00"), max_digits=8,
                validators=[django.core.validators.MinValueValidator(Decimal("0.01"))],
            ),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="gbp_audit_price",
            field=models.DecimalField(
                decimal_places=2, default=Decimal("100.00"), max_digits=8,
                validators=[django.core.validators.MinValueValidator(Decimal("0.01"))],
            ),
        ),
    ]
