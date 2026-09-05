from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0004_notification_related_dealer_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="enquiry",
            name="configuration",
            field=models.JSONField(blank=True, default=dict),
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
                    ("everything", "All of the above"),
                    ("unsure", "Not sure yet"),
                ],
                max_length=20,
            ),
        ),
    ]
