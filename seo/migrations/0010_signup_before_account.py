import secrets

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

import seo.models.subscriber


def copy_emails_and_detach_unpaid(apps, schema_editor):
    """Give every row an email and a reference; take the login off unpaid ones.

    An unpaid signup used to create a passwordless login. Under the new flow
    an unpaid signup has none, so those rows let go of it here. The login
    itself stays: payment for the same email reuses it rather than tripping
    over the unique username.
    """
    SeoSubscriber = apps.get_model("seo", "SeoSubscriber")
    for subscriber in SeoSubscriber.objects.select_related("user"):
        subscriber.email = subscriber.user.email if subscriber.user else ""
        subscriber.checkout_reference = secrets.token_urlsafe(24)
        if subscriber.payment_status == "payment_pending":
            subscriber.user = None
        subscriber.save(update_fields=["email", "checkout_reference", "user"])


class Migration(migrations.Migration):

    dependencies = [
        ("seo", "0009_setup_steps"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name="seosubscriber",
            name="user",
            field=models.OneToOneField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="seo_subscriber",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="seosubscriber",
            name="email",
            field=models.EmailField(default="", max_length=254),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="seosubscriber",
            name="checkout_reference",
            field=models.CharField(editable=False, max_length=64, null=True),
        ),
        migrations.RunPython(copy_emails_and_detach_unpaid, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="seosubscriber",
            name="checkout_reference",
            field=models.CharField(
                default=seo.models.subscriber.new_checkout_reference,
                editable=False,
                max_length=64,
                unique=True,
            ),
        ),
    ]
