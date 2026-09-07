from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("dealers", "0006_remove_dealer_email")]

    operations = [
        migrations.AlterField(
            model_name="dealer",
            name="plan",
            field=models.CharField(
                choices=[
                    ("licensing", "Online licensing"),
                    ("contracts", "Online contracts"),
                    ("complete", "Complete online sale"),
                ],
                db_index=True,
                default="complete",
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name="dealer",
            name="payment_status",
            field=models.CharField(
                choices=[
                    ("payment_pending", "Payment pending"),
                    ("active", "Active"),
                    ("past_due", "Past due"),
                    ("cancelled", "Cancelled"),
                ],
                db_index=True,
                default="payment_pending",
                max_length=20,
            ),
        ),
    ]
