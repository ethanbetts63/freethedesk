from decimal import Decimal

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0008_sitesettings"),
    ]

    operations = [
        migrations.AddField(
            model_name="sitesettings",
            name="ai_readiness_audit_price",
            field=models.DecimalField(
                decimal_places=2,
                default=Decimal("50.00"),
                max_digits=8,
                validators=[django.core.validators.MinValueValidator(Decimal("0.01"))],
            ),
        ),
    ]
