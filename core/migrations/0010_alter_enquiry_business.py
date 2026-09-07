from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("core", "0009_sitesettings_ai_readiness_audit_price")]

    operations = [
        migrations.AlterField(
            model_name="enquiry",
            name="business",
            field=models.CharField(blank=True, max_length=180),
        ),
    ]
