# SEO is one report at three prices. The one-off audit's price becomes
# Essentials, keeping whatever the admin set; the subscription prices go.

import django.core.validators
from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0026_website_one_page'),
    ]

    operations = [
        migrations.RenameField(
            model_name='sitesettings',
            old_name='seo_oneoff_price',
            new_name='seo_essentials_price',
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='seo_plus_price',
            field=models.DecimalField(decimal_places=2, default=Decimal('850.00'), max_digits=8, validators=[django.core.validators.MinValueValidator(Decimal('0.01'))]),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='seo_complete_price',
            field=models.DecimalField(decimal_places=2, default=Decimal('1400.00'), max_digits=8, validators=[django.core.validators.MinValueValidator(Decimal('0.01'))]),
        ),
        migrations.RemoveField(
            model_name='sitesettings',
            name='seo_monthly_price',
        ),
        migrations.RemoveField(
            model_name='sitesettings',
            name='seo_quarterly_price',
        ),
        migrations.RemoveField(
            model_name='sitesettings',
            name='seo_yearly_price',
        ),
    ]
