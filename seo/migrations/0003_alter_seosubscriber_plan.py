from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("seo", "0002_alter_seoprofile_onboarding_status"),
    ]

    operations = [
        migrations.AlterField(
            model_name="seosubscriber",
            name="plan",
            field=models.CharField(
                choices=[
                    ("monthly", "Monthly report"),
                    ("quarterly", "Quarterly report"),
                    ("biannual", "Bi-annual report"),
                    ("oneoff", "One-off report"),
                    ("gbp_audit", "Google Business Profile audit"),
                ],
                db_index=True,
                default="quarterly",
                max_length=20,
            ),
        ),
    ]
