from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("seo", "0021_prospect_body_list"),
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
                    (5, "5: the fixes list"),
                ],
                db_index=True,
                default=1,
            ),
        ),
    ]
