from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("core", "0002_alter_enquiry_help_with")]

    operations = [
        migrations.AddField(
            model_name="enquiry",
            name="status",
            field=models.CharField(
                choices=[
                    ("new", "New"),
                    ("contacted", "Contacted"),
                    ("qualified", "Qualified"),
                    ("won", "Won"),
                    ("closed", "Closed"),
                    ("spam", "Spam"),
                ],
                db_index=True,
                default="new",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="enquiry",
            name="updated_at",
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.CreateModel(
            name="Notification",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("recipient_type", models.CharField(choices=[("admin", "Admin"), ("manual", "Manual email")], max_length=20)),
                ("recipient", models.CharField(max_length=254)),
                ("channel", models.CharField(choices=[("email", "Email"), ("sms", "SMS")], max_length=10)),
                ("subject", models.CharField(blank=True, max_length=255)),
                ("body", models.TextField()),
                ("status", models.CharField(choices=[("pending", "Pending"), ("sent", "Sent"), ("failed", "Failed")], db_index=True, default="pending", max_length=20)),
                ("sent_at", models.DateTimeField(blank=True, null=True)),
                ("error_message", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("related_enquiry", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="notifications", to="core.enquiry")),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
