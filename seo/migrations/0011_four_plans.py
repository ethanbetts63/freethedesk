from django.db import migrations, models

MOVES = {"bimonthly": "quarterly", "biannual": "yearly"}


def move_retired_cadences(apps, schema_editor):
    """Every two months and every six months are gone; move anyone on them.

    Only our record changes. Their Stripe subscription still bills at the old
    interval until staff change it, so each move is printed for that.
    """
    SeoSubscriber = apps.get_model("seo", "SeoSubscriber")
    for old, new in MOVES.items():
        for subscriber in SeoSubscriber.objects.filter(plan=old):
            print(
                f"\n  SeoSubscriber {subscriber.pk} ({subscriber.business_name}): {old} -> {new}."
                " Update its Stripe subscription interval to match."
            )
            subscriber.plan = new
            subscriber.save(update_fields=["plan"])


class Migration(migrations.Migration):

    dependencies = [
        ("seo", "0010_signup_before_account"),
    ]

    operations = [
        migrations.RunPython(move_retired_cadences, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="seosubscriber",
            name="plan",
            field=models.CharField(
                choices=[
                    ("monthly", "Monthly"),
                    ("quarterly", "Quarterly"),
                    ("yearly", "Yearly"),
                    ("oneoff", "SEO audit"),
                ],
                db_index=True,
                default="monthly",
                max_length=20,
            ),
        ),
    ]
