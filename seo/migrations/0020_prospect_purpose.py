from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("seo", "0019_prospect_bodies"),
    ]

    operations = [
        migrations.AddField(
            model_name="seoprospect",
            name="purpose",
            field=models.CharField(
                choices=[("client", "Client"), ("affiliate", "Affiliate")],
                db_index=True,
                default="client",
                max_length=10,
            ),
        ),
        migrations.AlterField(
            model_name="seoprospect",
            name="body",
            field=models.TextField(blank=True),
        ),
        migrations.AlterField(
            model_name="seoprospect",
            name="body_version",
            field=models.PositiveSmallIntegerField(
                choices=[(1, "1: the report email"), (2, "2: the three-hour bet"), (3, "3: the affiliate offer")],
                db_index=True,
                default=1,
            ),
        ),
    ]
