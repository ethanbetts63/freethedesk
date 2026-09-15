import json
from hashlib import sha256

from django.conf import settings
from django.core.serializers.json import DjangoJSONEncoder
from django.db import migrations


DEALER_KEY = "dealer.subscription"
DEALER_TITLE = "Dealer Subscription Terms"
DEALER_CONFIGURED_VERSION = "2026-09-05"
DEALER_SOURCE_PARTS = (
    "frontend", "content", "legal", "dealer-subscription-terms.md",
)
DEALER_STATEMENT = (
    "I agree to the Dealer Subscription Terms, acknowledge the Privacy Policy, "
    "and authorise this monthly subscription."
)
SEO_KEY = "seo.reporting"
SEO_TITLE = "SEO Reporting & Audit Terms"
SEO_CONFIGURED_VERSION = "2026-09-09"
SEO_SOURCE_PARTS = (
    "frontend", "content", "legal", "seo-subscription-terms.md",
)


def _normalise_content(content):
    return str(content).replace("\r\n", "\n").replace("\r", "\n")


def _digest(content):
    return sha256(_normalise_content(content).encode("utf-8")).hexdigest()


def _normalise_json(value):
    return json.loads(json.dumps(value or {}, cls=DjangoJSONEncoder, sort_keys=True))


def _canonical_json(value):
    return json.dumps(
        _normalise_json(value), sort_keys=True, separators=(",", ":"), ensure_ascii=False
    )


def _fingerprint(*, version_id, content_type_id, object_id, user_id, context, statement):
    evidence = {
        "agreement_version_id": version_id,
        "content_type_id": content_type_id,
        "object_id": str(object_id),
        "accepted_by_id": user_id,
        "context": context,
        "statement": statement,
        "source": "web.checkout",
    }
    return sha256(_canonical_json(evidence).encode("utf-8")).hexdigest()


def _file_content(path):
    try:
        return path.read_text(encoding="utf-8")
    except (OSError, UnicodeError):
        return None


def _legacy_version_label(version_label, suffix, counter=None):
    discriminator = f"-legacy-{suffix}"
    if counter is not None:
        discriminator += f"-{counter}"
    return f"{version_label[:50 - len(discriminator)]}{discriminator}"


def _version_for(
    Version, agreement, *, version_label, recorded_hash, configured_content,
    accepted_at,
):
    content_matches = configured_content is not None and recorded_hash in {
        _digest(configured_content),
        sha256(configured_content.encode("utf-8")).hexdigest(),
    }
    content = _normalise_content(configured_content) if content_matches else ""
    archived = bool(content_matches)
    canonical_hash = _digest(content) if archived else recorded_hash
    label = version_label

    existing = Version.objects.filter(agreement=agreement, version=label).first()
    if existing and existing.content_sha256 != canonical_hash:
        suffix = (recorded_hash or "unknown")[:8]
        label = _legacy_version_label(version_label, suffix)
        counter = 2
        while Version.objects.filter(agreement=agreement, version=label).exists():
            label = _legacy_version_label(version_label, suffix, counter)
            counter += 1

    version, _ = Version.objects.get_or_create(
        agreement=agreement,
        version=label,
        defaults={
            "content": content,
            "content_format": "markdown",
            "content_sha256": canonical_hash or "legacy-not-recorded",
            "content_archived": archived,
            "published_at": accepted_at,
            "metadata": {
                "legacy_terms_version": version_label,
                "legacy_terms_sha256": recorded_hash,
            },
        },
    )
    return version


def _actor_snapshot(user):
    snapshot = {"user_id": str(user.pk)}
    username = getattr(user, "username", "")
    email = getattr(user, "email", "")
    if username:
        snapshot["username"] = username
    if email:
        snapshot["email"] = email
    return snapshot


def forwards(apps, schema_editor):
    Agreement = apps.get_model("ftp_agreements", "Agreement")
    Version = apps.get_model("ftp_agreements", "AgreementVersion")
    Acceptance = apps.get_model("ftp_agreements", "Acceptance")
    ContentType = apps.get_model("contenttypes", "ContentType")
    DealerAcceptance = apps.get_model("payments", "DealerSubscriptionTermsAcceptance")
    SeoAcceptance = apps.get_model("payments", "SeoSubscriptionTermsAcceptance")

    dealer_agreement, _ = Agreement.objects.get_or_create(
        key=DEALER_KEY, defaults={"title": DEALER_TITLE}
    )
    seo_agreement, _ = Agreement.objects.get_or_create(
        key=SEO_KEY, defaults={"title": SEO_TITLE}
    )
    dealer_content = _file_content(settings.BASE_DIR.joinpath(*DEALER_SOURCE_PARTS))
    seo_content = _file_content(settings.BASE_DIR.joinpath(*SEO_SOURCE_PARTS))
    dealer_ct, _ = ContentType.objects.get_or_create(app_label="dealers", model="dealer")
    seo_ct, _ = ContentType.objects.get_or_create(app_label="seo", model="seosubscriber")

    for old in DealerAcceptance.objects.select_related("dealer", "accepted_by").all():
        version = _version_for(
            Version,
            dealer_agreement,
            version_label=old.terms_version,
            recorded_hash=old.terms_sha256,
            configured_content=dealer_content,
            accepted_at=old.accepted_at,
        )
        context = {
            "plan": old.plan,
            "price": str(old.monthly_price),
            "currency": old.currency,
            "billing_mode": "subscription",
            "billing_interval": "month",
            "tax_inclusive": True,
        }
        fingerprint = _fingerprint(
            version_id=version.pk,
            content_type_id=dealer_ct.pk,
            object_id=old.dealer_id,
            user_id=old.accepted_by_id,
            context=context,
            statement=DEALER_STATEMENT,
        )
        Acceptance.objects.get_or_create(
            fingerprint=fingerprint,
            defaults={
                "agreement_version": version,
                "accepted_by_id": old.accepted_by_id,
                "content_type": dealer_ct,
                "object_id": str(old.dealer_id),
                "subject_reference": str(old.dealer_id),
                "subject_label": getattr(old.dealer, "business_name", str(old.dealer_id)),
                "actor_snapshot": _actor_snapshot(old.accepted_by),
                "statement": DEALER_STATEMENT,
                "context": context,
                "context_sha256": sha256(_canonical_json(context).encode("utf-8")).hexdigest(),
                "metadata": {"legacy_stripe_checkout_session_id": old.stripe_checkout_session_id},
                "accepted_ip": old.accepted_ip,
                "source": "web.checkout",
                "accepted_at": old.accepted_at,
            },
        )

    for old in SeoAcceptance.objects.select_related("subscriber", "accepted_by").all():
        version = _version_for(
            Version,
            seo_agreement,
            version_label=old.terms_version,
            recorded_hash=old.terms_sha256,
            configured_content=seo_content,
            accepted_at=old.accepted_at,
        )
        mode = "payment" if old.plan == "oneoff" else "subscription"
        statement = (
            "I agree to the SEO Reporting & Audit Terms, acknowledge the Privacy Policy, "
            f"and authorise this {'payment' if mode == 'payment' else 'recurring subscription'}."
        )
        context = {
            "plan": old.plan,
            "report_type": old.report_type,
            "price": str(old.price),
            "currency": old.currency,
            "billing_mode": mode,
            "tax_inclusive": True,
        }
        fingerprint = _fingerprint(
            version_id=version.pk,
            content_type_id=seo_ct.pk,
            object_id=old.subscriber_id,
            user_id=old.accepted_by_id,
            context=context,
            statement=statement,
        )
        Acceptance.objects.get_or_create(
            fingerprint=fingerprint,
            defaults={
                "agreement_version": version,
                "accepted_by_id": old.accepted_by_id,
                "content_type": seo_ct,
                "object_id": str(old.subscriber_id),
                "subject_reference": str(old.subscriber_id),
                "subject_label": getattr(old.subscriber, "business_name", str(old.subscriber_id)),
                "actor_snapshot": _actor_snapshot(old.accepted_by),
                "statement": statement,
                "context": context,
                "context_sha256": sha256(_canonical_json(context).encode("utf-8")).hexdigest(),
                "metadata": {"legacy_stripe_checkout_session_id": old.stripe_checkout_session_id},
                "accepted_ip": old.accepted_ip,
                "source": "web.checkout",
                "accepted_at": old.accepted_at,
            },
        )

    for agreement, configured_version, configured_content in (
        (dealer_agreement, DEALER_CONFIGURED_VERSION, dealer_content),
        (seo_agreement, SEO_CONFIGURED_VERSION, seo_content),
    ):
        version = Version.objects.filter(
            agreement=agreement, version=configured_version, content_archived=True
        ).first()
        if version and configured_content is not None and version.content_sha256 == _digest(configured_content):
            agreement.current_version = version
            agreement.save(update_fields=["current_version"])


def backwards(apps, schema_editor):
    Acceptance = apps.get_model("ftp_agreements", "Acceptance")
    DealerAcceptance = apps.get_model("payments", "DealerSubscriptionTermsAcceptance")
    SeoAcceptance = apps.get_model("payments", "SeoSubscriptionTermsAcceptance")

    rows = Acceptance.objects.select_related(
        "agreement_version__agreement", "content_type"
    ).filter(agreement_version__agreement__key__in=[DEALER_KEY, SEO_KEY])
    for acceptance in rows:
        if not acceptance.accepted_by_id or not acceptance.content_type_id:
            continue
        version = acceptance.agreement_version
        original_version = version.metadata.get("legacy_terms_version", version.version)
        original_hash = version.metadata.get("legacy_terms_sha256", version.content_sha256)
        stripe_session = acceptance.metadata.get("legacy_stripe_checkout_session_id", "")
        context = acceptance.context
        if version.agreement.key == DEALER_KEY:
            old, _ = DealerAcceptance.objects.get_or_create(
                dealer_id=acceptance.object_id,
                plan=context.get("plan", ""),
                monthly_price=context.get("price", "0"),
                currency=context.get("currency", "AUD"),
                terms_version=original_version,
                terms_sha256=original_hash,
                defaults={
                    "accepted_by_id": acceptance.accepted_by_id,
                    "accepted_ip": acceptance.accepted_ip,
                    "stripe_checkout_session_id": stripe_session,
                },
            )
        else:
            old, _ = SeoAcceptance.objects.get_or_create(
                subscriber_id=acceptance.object_id,
                plan=context.get("plan", ""),
                report_type=context.get("report_type", "both"),
                price=context.get("price", "0"),
                currency=context.get("currency", "AUD"),
                terms_version=original_version,
                terms_sha256=original_hash,
                defaults={
                    "accepted_by_id": acceptance.accepted_by_id,
                    "accepted_ip": acceptance.accepted_ip,
                    "stripe_checkout_session_id": stripe_session,
                },
            )
        type(old).objects.filter(pk=old.pk).update(accepted_at=acceptance.accepted_at)


class Migration(migrations.Migration):
    dependencies = [
        ("ftp_agreements", "0001_initial"),
        ("payments", "0006_separate_seo_report_type_and_frequency"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
        migrations.DeleteModel(name="DealerSubscriptionTermsAcceptance"),
        migrations.DeleteModel(name="SeoSubscriptionTermsAcceptance"),
    ]
