# Give every existing sale its customer account.
#
# Only sales whose link was ever sent (a password hash exists) create accounts
# — a draft's customer has been told nothing, and conjuring an account from a
# dealer's keystroke would be premature. Created accounts get an unusable
# password (no temporary password can be emailed retroactively); the customer
# claims theirs through "forgot password". Cancelled sales link only to an
# account that already exists.

from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.db import migrations


def link_accounts(apps, schema_editor):
    Sale = apps.get_model("sales", "Sale")
    User = apps.get_model(settings.AUTH_USER_MODEL)

    for sale in Sale.objects.filter(account__isnull=True).order_by("created_at"):
        email = (sale.customer_email or "").strip().lower()
        if not email:
            continue
        user = User.objects.filter(username__iexact=email).first()
        if user is None:
            if not sale.access_password_hash or sale.status == "cancelled":
                continue
            user = User.objects.create(
                username=email,
                email=email,
                first_name=(sale.customer_name or "").strip()[:150],
                password=make_password(None),
            )
        sale.account = user
        sale.save(update_fields=["account"])


class Migration(migrations.Migration):
    dependencies = [
        ("sales", "0002_sale_account"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RunPython(link_accounts, migrations.RunPython.noop),
    ]
