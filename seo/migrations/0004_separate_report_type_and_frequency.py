from django.db import migrations, models


def move_google_audit_plan(apps, schema_editor):
    SeoSubscriber = apps.get_model("seo", "SeoSubscriber")
    SeoSubscriber.objects.filter(plan="gbp_audit").update(plan="oneoff", report_type="gbp")


class Migration(migrations.Migration):
    dependencies = [
        ("seo", "0003_alter_seosubscriber_plan"),
    ]

    operations = [
        migrations.AddField(
            model_name="seosubscriber",
            name="report_type",
            field=models.CharField(
                choices=[
                    ("gbp", "Google Business Profile report"),
                    ("seo", "SEO report"),
                    ("both", "Google Business Profile + SEO report"),
                ],
                db_index=True,
                default="both",
                max_length=10,
            ),
        ),
        migrations.RunPython(move_google_audit_plan, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="seosubscriber",
            name="plan",
            field=models.CharField(
                choices=[
                    ("monthly", "Monthly report"),
                    ("quarterly", "Quarterly report"),
                    ("biannual", "Bi-annual report"),
                    ("oneoff", "One-off report"),
                ],
                db_index=True,
                default="quarterly",
                max_length=20,
            ),
        ),
    ]
