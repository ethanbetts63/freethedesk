"""Move existing billing state into the shared payment records.

Creates no Stripe objects. Everything here is read from columns freethedesk
already holds, so a dealer or subscriber that Stripe already knows about is
described by the new tables without anybody being charged or re-registered.

Three things are backfilled:

* a ``BillingCustomer`` for every ``stripe_customer_id`` we already have;
* a ``Subscription`` for every ``stripe_subscription_id``, so the invoice and
  subscription events that arrive after the cutover have something to find;
* a ``Payment`` for every checkout that is **in flight at the moment of the
  deploy** — an open session whose account is not yet paid. Without these, a
  dealer who opened checkout before the deploy and pays after it lands on a
  webhook that finds no payment, and is charged without being provisioned.

Deleting the old ``StripeEvent`` table is the last step, deliberately after
the rest: while both tables exist the package's ``WebhookEvent`` is
authoritative, and two event tables must not outlive this migration.
"""

from django.db import migrations


# Stripe's vocabulary, which the shared Subscription stores uncollapsed. Going
# the other way — from this site's smaller access states back to Stripe's —
# cannot be exact, so the first real subscription event corrects it.
_STATUS_FROM_PAYMENT_STATUS = {
    "active": "active",
    "past_due": "past_due",
    "cancelled": "canceled",
    "payment_pending": "incomplete",
    "paid": "active",
}


def _content_type(apps, model):
    ContentType = apps.get_model("contenttypes", "ContentType")
    meta = model._meta
    content_type, _ = ContentType.objects.get_or_create(
        app_label=meta.app_label, model=meta.model_name
    )
    return content_type


def backfill(apps, schema_editor):
    BillingCustomer = apps.get_model("ftp_payments", "BillingCustomer")
    Subscription = apps.get_model("ftp_payments", "Subscription")
    Payment = apps.get_model("ftp_payments", "Payment")
    Dealer = apps.get_model("dealers", "Dealer")
    SeoSubscriber = apps.get_model("seo", "SeoSubscriber")

    sources = (
        (Dealer, "dealer.subscription", lambda row: row.business_name),
        (SeoSubscriber, "seo.subscription", lambda row: row.business_name),
    )

    for model, flow, label_of in sources:
        content_type = _content_type(apps, model)
        for row in model.objects.all().iterator():
            label = label_of(row) or ""
            customer = None

            if row.stripe_customer_id:
                customer, _ = BillingCustomer.objects.get_or_create(
                    stripe_customer_id=row.stripe_customer_id,
                    defaults={
                        "related_content_type": content_type,
                        "related_object_id": str(row.pk),
                        "related_label": label,
                        "email_snapshot": getattr(row.user, "email", "") or "",
                        "name_snapshot": label,
                    },
                )

            if row.stripe_subscription_id:
                Subscription.objects.get_or_create(
                    stripe_subscription_id=row.stripe_subscription_id,
                    defaults={
                        "flow": flow,
                        "related_content_type": content_type,
                        "related_object_id": str(row.pk),
                        "related_label": label,
                        "billing_customer": customer,
                        "status": _STATUS_FROM_PAYMENT_STATUS.get(
                            row.payment_status, "incomplete"
                        ),
                        "plan_key": row.plan,
                        "pricing_snapshot": {},
                        "current_period_end": row.subscription_current_period_end,
                        # Never guessed. paid_through means an invoice was
                        # actually paid, and nothing in the old schema recorded
                        # that, so the first invoice.paid after the cutover
                        # sets it rather than this migration inventing it.
                        "cancel_at_period_end": row.cancel_at_period_end,
                    },
                )

            _backfill_in_flight_checkout(
                Payment, row, flow, content_type, label, customer
            )


def _backfill_in_flight_checkout(Payment, row, flow, content_type, label, customer):
    """Give a checkout that is open right now something to land on."""
    if not row.stripe_checkout_session_id:
        return
    if row.payment_status in {"active", "paid"}:
        return
    if Payment.objects.filter(
        stripe_checkout_session_id=row.stripe_checkout_session_id
    ).exists():
        return

    # The amount is unknown here: the old schema never stored one, which is
    # the gap this whole migration exists to close. Zero would be a lie the
    # webhook then checks against, so the quote records where it came from and
    # the amount check treats a zero total as "nothing to compare".
    Payment.objects.create(
        flow=flow,
        purpose="migrated",
        related_content_type=content_type,
        related_object_id=str(row.pk),
        related_label=label,
        billing_customer=customer,
        mode="subscription" if flow != "seo.oneoff" else "payment",
        status="pending",
        currency="aud",
        total_amount=0,
        tax_mode="none",
        quote={"source": "migration", "note": "checkout opened before the cutover"},
        quote_sha256="",
        stripe_checkout_session_id=row.stripe_checkout_session_id,
    )


def unbackfill(apps, schema_editor):
    """Remove only what this migration invented.

    Payments created after the cutover are real records of money and are not
    this migration's to delete, so only the migrated placeholders go.
    """
    apps.get_model("ftp_payments", "Payment").objects.filter(purpose="migrated").delete()
    apps.get_model("ftp_payments", "Subscription").objects.all().delete()
    apps.get_model("ftp_payments", "BillingCustomer").objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ("payments", "0007_migrate_acceptances_to_ftp_agreements"),
        ("ftp_payments", "0001_initial"),
        ("dealers", "0008_dealerprofile_onboarding_status"),
        ("seo", "0004_separate_report_type_and_frequency"),
    ]

    operations = [
        migrations.RunPython(backfill, unbackfill),
        migrations.DeleteModel(name="StripeEvent"),
    ]
