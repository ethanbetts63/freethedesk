from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0011_notification_related_seo_subscriber_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="sitesettings",
            name="ai_readiness_audit_price",
        ),
        migrations.AlterField(
            model_name="enquiry",
            name="help_with",
            field=models.CharField(
                choices=[
                    ("website", "Dealer website"),
                    ("website_builder", "Dealer web enquiry"),
                    ("inventory", "Inventory, parts, service or hire"),
                    ("automation", "Business automation"),
                    ("ai_readiness", "AI readiness check"),
                    ("everything", "All of the above"),
                    ("unsure", "Not sure yet"),
                ],
                max_length=20,
            ),
        ),
    ]
