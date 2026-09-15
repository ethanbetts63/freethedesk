from hashlib import sha256
from importlib import import_module

import pytest
from django.conf import settings
from django.db import connection
from django.db.migrations.executor import MigrationExecutor


FROM_PAYMENT = ("payments", "0006_separate_seo_report_type_and_frequency")
TO_PAYMENT = ("payments", "0007_migrate_acceptances_to_ftp_agreements")


def test_legacy_version_labels_keep_their_collision_suffix():
    migration = import_module("payments.migrations.0007_migrate_acceptances_to_ftp_agreements")
    original = "v" * 50

    first = migration._legacy_version_label(original, "12345678")
    second = migration._legacy_version_label(original, "12345678", 2)

    assert len(first) == 50
    assert first.endswith("-legacy-12345678")
    assert len(second) == 50
    assert second.endswith("-legacy-12345678-2")
    assert first != second


def _normalised_file_hash(path):
    content = path.read_text(encoding="utf-8").replace("\r\n", "\n").replace("\r", "\n")
    return sha256(content.encode("utf-8")).hexdigest()


def _targets(loader, *, payment, include_agreements):
    targets = [
        node for node in loader.graph.leaf_nodes()
        if node[0] not in {"payments", "ftp_agreements"}
    ]
    targets.append(payment)
    targets.append(
        ("ftp_agreements", "0001_initial")
        if include_agreements else ("ftp_agreements", None)
    )
    return targets


@pytest.mark.django_db(transaction=True)
def test_existing_ftd_acceptances_are_preserved():
    dealer_document = settings.FTP_AGREEMENTS["DOCUMENTS"]["dealer.subscription"]
    seo_document = settings.FTP_AGREEMENTS["DOCUMENTS"]["seo.reporting"]
    executor = MigrationExecutor(connection)
    old_targets = _targets(
        executor.loader, payment=FROM_PAYMENT, include_agreements=False
    )
    executor.migrate(old_targets)
    old_apps = executor.loader.project_state(
        [target for target in old_targets if target[1] is not None]
    ).apps

    User = old_apps.get_model("auth", "User")
    Dealer = old_apps.get_model("dealers", "Dealer")
    Subscriber = old_apps.get_model("seo", "SeoSubscriber")
    DealerAcceptance = old_apps.get_model("payments", "DealerSubscriptionTermsAcceptance")
    SeoAcceptance = old_apps.get_model("payments", "SeoSubscriptionTermsAcceptance")

    user = User.objects.create(username="migration-user", email="migration@example.com")
    dealer = Dealer.objects.create(
        user=user, business_name="Migration Motors", contact_name="Test Person"
    )
    subscriber_user = User.objects.create(
        username="seo-migration-user", email="seo-migration@example.com"
    )
    subscriber = Subscriber.objects.create(
        user=subscriber_user, business_name="Migration SEO", contact_name="Test Person"
    )
    DealerAcceptance.objects.create(
        dealer=dealer,
        accepted_by=user,
        plan="complete",
        monthly_price="219.50",
        currency="AUD",
        terms_version=dealer_document["VERSION"],
        terms_sha256=_normalised_file_hash(dealer_document["SOURCE"]),
        accepted_ip="203.0.113.10",
        stripe_checkout_session_id="cs_dealer_legacy",
    )
    SeoAcceptance.objects.create(
        subscriber=subscriber,
        accepted_by=subscriber_user,
        plan="quarterly",
        report_type="both",
        price="250.00",
        currency="AUD",
        terms_version=seo_document["VERSION"],
        terms_sha256=_normalised_file_hash(seo_document["SOURCE"]),
        accepted_ip="203.0.113.11",
        stripe_checkout_session_id="cs_seo_legacy",
    )

    executor = MigrationExecutor(connection)
    new_targets = _targets(
        executor.loader, payment=TO_PAYMENT, include_agreements=True
    )
    executor.migrate(new_targets)
    new_apps = executor.loader.project_state(
        [target for target in new_targets if target[1] is not None]
    ).apps

    Agreement = new_apps.get_model("ftp_agreements", "Agreement")
    Acceptance = new_apps.get_model("ftp_agreements", "Acceptance")

    dealer_row = Acceptance.objects.get(
        agreement_version__agreement__key="dealer.subscription"
    )
    assert dealer_row.object_id == str(dealer.pk)
    assert dealer_row.context["price"] == "219.50"
    assert dealer_row.accepted_ip == "203.0.113.10"
    assert dealer_row.metadata["legacy_stripe_checkout_session_id"] == "cs_dealer_legacy"
    assert dealer_row.agreement_version.content_archived is True

    seo_row = Acceptance.objects.get(
        agreement_version__agreement__key="seo.reporting"
    )
    assert seo_row.object_id == str(subscriber.pk)
    assert seo_row.context["report_type"] == "both"
    assert seo_row.metadata["legacy_stripe_checkout_session_id"] == "cs_seo_legacy"
    assert seo_row.agreement_version.content_archived is True
    assert Agreement.objects.get(key="dealer.subscription").current_version_id
    assert Agreement.objects.get(key="seo.reporting").current_version_id
