from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("seo", "0020_prospect_purpose"),
    ]

    operations = [
        migrations.AlterField(
            model_name="seoprospect",
            name="body_version",
            field=models.PositiveSmallIntegerField(
                choices=[
                    (1, "1: the report email"),
                    (2, "2: the three-hour bet"),
                    (3, "3: the affiliate offer"),
                    (4, "4: the bet with the list"),
                ],
                db_index=True,
                default=1,
            ),
        ),
    ]
