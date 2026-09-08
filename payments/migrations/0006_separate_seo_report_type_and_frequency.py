from django.db import migrations, models


def move_google_audit_acceptances(apps, schema_editor):
    Acceptance = apps.get_model("payments", "SeoSubscriptionTermsAcceptance")
    Acceptance.objects.filter(plan="gbp_audit").update(plan="oneoff", report_type="gbp")


class Migration(migrations.Migration):
    dependencies = [
        ("payments", "0005_alter_seosubscriptiontermsacceptance_plan"),
        ("seo", "0004_separate_report_type_and_frequency"),
    ]

    operations = [
        migrations.AddField(
            model_name="seosubscriptiontermsacceptance",
            name="report_type",
            field=models.CharField(
                choices=[
                    ("gbp", "Google Business Profile report"),
                    ("seo", "SEO report"),
                    ("both", "Google Business Profile + SEO report"),
                ],
                default="both",
                max_length=10,
            ),
            preserve_default=False,
        ),
        migrations.RunPython(move_google_audit_acceptances, migrations.RunPython.noop),
        migrations.RemoveConstraint(
            model_name="seosubscriptiontermsacceptance",
            name="unique_seo_subscription_offer_acceptance",
        ),
        migrations.AlterField(
            model_name="seosubscriptiontermsacceptance",
            name="plan",
            field=models.CharField(
                choices=[
                    ("monthly", "Monthly report"),
                    ("quarterly", "Quarterly report"),
                    ("biannual", "Bi-annual report"),
                    ("oneoff", "One-off report"),
                ],
                max_length=20,
            ),
        ),
        migrations.AddConstraint(
            model_name="seosubscriptiontermsacceptance",
            constraint=models.UniqueConstraint(
                fields=("subscriber", "plan", "report_type", "price", "currency", "terms_version", "terms_sha256"),
                name="unique_seo_subscription_offer_acceptance",
            ),
        ),
    ]
