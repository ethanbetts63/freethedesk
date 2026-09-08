from django.db import migrations, models


def collapse_legacy_statuses(apps, schema_editor):
    """Fold the three states nothing ever set into the three that remain.

    `verified` and `rejected` duplicated Dealer.status, which is where staff
    approval actually lives; `changes_requested` was never wired up. No code
    path could produce any of them, so this should be a no-op in practice — it
    is here so a hand-edited row cannot survive as an invalid choice.
    """
    DealerProfile = apps.get_model("dealers", "DealerProfile")
    DealerProfile.objects.filter(onboarding_status__in=["verified", "rejected"]).update(
        onboarding_status="submitted"
    )
    DealerProfile.objects.filter(onboarding_status="changes_requested").update(
        onboarding_status="in_progress"
    )


class Migration(migrations.Migration):
    dependencies = [("dealers", "0007_remove_dealer_demo_plan")]

    operations = [
        # Renamed rather than dropped and re-added, so existing progress survives.
        migrations.RenameField(
            model_name="dealerprofile",
            old_name="verification_status",
            new_name="onboarding_status",
        ),
        migrations.RunPython(collapse_legacy_statuses, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="dealerprofile",
            name="onboarding_status",
            field=models.CharField(
                choices=[
                    ("not_started", "Not started"),
                    ("in_progress", "In progress"),
                    ("submitted", "Submitted"),
                ],
                db_index=True,
                default="not_started",
                max_length=20,
            ),
        ),
    ]
