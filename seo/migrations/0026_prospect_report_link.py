# The report's link (owner, 2026-11-04): the page beside the PDF, an unguessable token per row, and the opens log.
# The token is added in three steps because a callable default is evaluated once for every existing row: nullable,
# filled row by row, then unique.

import django.db.models.deletion
from django.db import migrations, models

import seo.models.prospect
import seo.models.storage


def fill_tokens(apps, schema_editor):
    SeoProspect = apps.get_model("seo", "SeoProspect")
    for prospect in SeoProspect.objects.filter(link_token__isnull=True):
        prospect.link_token = seo.models.prospect.new_link_token()
        prospect.save(update_fields=["link_token"])


class Migration(migrations.Migration):

    dependencies = [
        ("seo", "0025_prospect_follow_up_versions"),
    ]

    operations = [
        migrations.AddField(
            model_name="seoprospect",
            name="report_html",
            field=models.FileField(
                blank=True, max_length=255, storage=seo.models.storage.private_prospect_report_storage, upload_to=""
            ),
        ),
        migrations.AddField(
            model_name="seoprospect",
            name="link_token",
            field=models.CharField(max_length=16, null=True),
        ),
        migrations.RunPython(fill_tokens, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="seoprospect",
            name="link_token",
            field=models.CharField(default=seo.models.prospect.new_link_token, max_length=16, unique=True),
        ),
        migrations.CreateModel(
            name="SeoProspectOpen",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("opened_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("kind", models.CharField(choices=[("page", "The page"), ("pdf", "The PDF")], default="page", max_length=8)),
                ("source", models.CharField(blank=True, max_length=20)),
                ("user_agent", models.CharField(blank=True, max_length=300)),
                ("likely_bot", models.BooleanField(default=False)),
                (
                    "prospect",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name="opens", to="seo.seoprospect"
                    ),
                ),
            ],
            options={"ordering": ["-opened_at"]},
        ),
    ]
