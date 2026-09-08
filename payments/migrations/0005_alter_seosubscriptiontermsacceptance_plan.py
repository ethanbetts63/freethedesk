from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("payments", "0004_seosubscriptiontermsacceptance"),
        ("seo", "0003_alter_seosubscriber_plan"),
    ]

    operations = [
        migrations.AlterField(
            model_name="seosubscriptiontermsacceptance",
            name="plan",
            field=models.CharField(
                choices=[
                    ("monthly", "Monthly report"),
                    ("quarterly", "Quarterly report"),
                    ("biannual", "Bi-annual report"),
                    ("oneoff", "One-off report"),
                    ("gbp_audit", "Google Business Profile audit"),
                ],
                max_length=20,
            ),
        ),
    ]
