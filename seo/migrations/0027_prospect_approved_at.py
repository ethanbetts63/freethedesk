# A report is uploaded when it is done and emailed only once the owner approves it (owner, 2026-11-05): the
# approval mark. Every row here already went up after approval under the old rule, so each is marked approved when it
# was created, and nothing already queued is held back.

from django.db import migrations, models
from django.db.models import F


def approve_existing(apps, schema_editor):
    SeoProspect = apps.get_model("seo", "SeoProspect")
    SeoProspect.objects.filter(approved_at__isnull=True).update(approved_at=F("created_at"))


class Migration(migrations.Migration):

    dependencies = [
        ("seo", "0026_prospect_report_link"),
    ]

    operations = [
        migrations.AddField(
            model_name="seoprospect",
            name="approved_at",
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.RunPython(approve_existing, migrations.RunPython.noop),
    ]
