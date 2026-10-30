from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("seo", "0022_prospect_body_fixes"),
    ]

    operations = [
        migrations.AlterField(
            model_name="seoprospect",
            name="subject_version",
            field=models.PositiveSmallIntegerField(
                choices=[
                    (1, "1: I spent 3 hours on this"),
                    (2, "2: N free fixes for the domain"),
                    (3, "3: Your ad, and what your site is missing"),
                    (4, "4: A free SEO report for the business"),
                    (5, "5: Not on Google's first page"),
                    (6, "6: A list of fixes for the domain"),
                    (7, "7: What's wrong with the domain, and how to fix it"),
                ],
                db_index=True,
            ),
        ),
    ]
