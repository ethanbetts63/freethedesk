import django.core.validators
from django.db import migrations, models


def six_page_small_package(apps, schema_editor):
    """The first package became a 6-page website; move only the old default."""
    SiteSettings = apps.get_model("core", "SiteSettings")
    SiteSettings.objects.filter(website_small_pages=5).update(website_small_pages=6)


class Migration(migrations.Migration):
    """Two website packages and a web application package.

    The website packages are now a small and a large site (6 and 10 pages by
    default) instead of three tiers, so the third tier's settings go. The web
    application package is bought as its discovery, priced from the hourly rate
    and discovery hours already here. Package orders record themselves as
    enquiries, and a web application order needs its own enquiry type.
    """

    dependencies = [
        ("core", "0019_enquiry_types_without_builder"),
    ]

    operations = [
        migrations.RenameField("sitesettings", "website_launch_pages", "website_small_pages"),
        migrations.RenameField(
            "sitesettings", "website_launch_page_price", "website_small_page_price"
        ),
        migrations.RenameField("sitesettings", "website_grow_pages", "website_large_pages"),
        migrations.RenameField(
            "sitesettings", "website_grow_page_price", "website_large_page_price"
        ),
        migrations.RemoveField("sitesettings", "website_connect_pages"),
        migrations.RemoveField("sitesettings", "website_connect_page_price"),
        migrations.AlterField(
            model_name="sitesettings",
            name="website_small_pages",
            field=models.PositiveSmallIntegerField(
                default=6,
                validators=[django.core.validators.MinValueValidator(1)],
            ),
        ),
        migrations.RunPython(six_page_small_package, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="enquiry",
            name="help_with",
            field=models.CharField(
                choices=[
                    ("website", "Website"),
                    ("web_application", "Web application"),
                    ("automation", "Business automation"),
                    ("ai_readiness", "AI readiness check"),
                    ("everything", "Website and automation"),
                ],
                max_length=20,
            ),
        ),
    ]
