from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("dealers", "0007_remove_dealer_demo_plan"),
        (
            "payments",
            "0002_remove_dealersubscriptiontermsacceptance_unique_dealer_subscription_offer_acceptance_and_more",
        ),
    ]

    operations = [
        migrations.AlterField(
            model_name="dealersubscriptiontermsacceptance",
            name="plan",
            field=models.CharField(
                choices=[
                    ("licensing", "Online licensing"),
                    ("contracts", "Online contracts"),
                    ("complete", "Complete online sale"),
                ],
                max_length=20,
            ),
        ),
    ]
