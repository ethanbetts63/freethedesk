import pytest
from django.urls import reverse

from core.tests.factories import UserFactory
from seo.models import SeoProfile, SeoSubscriber

pytestmark = pytest.mark.django_db


def test_login_returns_seo_principal(client, seo_subscriber):
    response = client.post(
        reverse("token"),
        {"username": "s@example.com", "password": "Sturdy-Passphrase-42"},
        content_type="application/json",
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["role"] == "seo"
    assert not payload["is_staff"]
    assert payload["seo"]["business_name"] == "Peak Digital"
    assert payload["seo"]["status"] == "pending"
    assert payload["dealer"] is None


def test_user_without_a_portal_is_refused(client, seo_subscriber):
    UserFactory(username="nobody@example.com")
    response = client.post(
        reverse("token"),
        {"username": "nobody@example.com", "password": "Sturdy-Passphrase-42"},
        content_type="application/json",
    )
    assert response.status_code == 403


def test_subscriber_can_read_and_update_own_account(client, seo_subscriber):
    client.force_login(seo_subscriber.user)
    assert client.get(reverse("seo-account")).json()["business_name"] == "Peak Digital"

    response = client.patch(
        reverse("seo-account"),
        {"business_name": "Peak Digital Pty Ltd", "website": "https://peak.example"},
        content_type="application/json",
    )
    assert response.status_code == 200
    seo_subscriber.refresh_from_db()
    assert seo_subscriber.business_name == "Peak Digital Pty Ltd"
    assert seo_subscriber.website == "https://peak.example"


def test_provisional_subscriber_can_set_a_password(client, seo_subscriber):
    seo_subscriber.user.set_unusable_password()
    seo_subscriber.user.save(update_fields=["password"])
    client.force_login(seo_subscriber.user)

    response = client.post(
        reverse("seo-set-password"),
        {"password": "A-New-Sturdy-Passphrase-52"},
        content_type="application/json",
    )

    assert response.status_code == 200
    seo_subscriber.user.refresh_from_db()
    assert seo_subscriber.user.check_password("A-New-Sturdy-Passphrase-52")


def test_subscriber_cannot_change_own_status_or_plan(client, seo_subscriber):
    client.force_login(seo_subscriber.user)
    client.patch(
        reverse("seo-account"),
        {"status": "active", "plan": "monthly", "report_type": "gbp"},
        content_type="application/json",
    )
    seo_subscriber.refresh_from_db()
    assert seo_subscriber.status == SeoSubscriber.Status.PENDING
    assert seo_subscriber.plan == SeoSubscriber.Plan.QUARTERLY
    assert seo_subscriber.report_type == SeoSubscriber.ReportType.SEO


def test_staff_cannot_use_the_seo_account_endpoint(client, seo_subscriber, staff_user):
    client.force_login(staff_user)
    assert client.get(reverse("seo-account")).status_code == 403


def test_onboarding_requires_paid_status(client, seo_subscriber):
    client.force_login(seo_subscriber.user)
    assert client.get(reverse("seo-onboarding")).status_code == 403


def test_paid_subscriber_can_save_onboarding_draft(client, paid_seo_subscriber):
    client.force_login(paid_seo_subscriber.user)
    response = client.patch(
        reverse("seo-onboarding"),
        {"search_console_property": "sc-domain:peak.example", "target_keywords": "vespa perth"},
        content_type="application/json",
    )
    assert response.status_code == 200
    profile = SeoProfile.objects.get(subscriber=paid_seo_subscriber)
    assert profile.search_console_property == "sc-domain:peak.example"
    assert profile.onboarding_status == SeoProfile.OnboardingStatus.IN_PROGRESS


def test_onboarding_submit_requires_the_core_fields(client, paid_seo_subscriber):
    client.force_login(paid_seo_subscriber.user)
    response = client.post(reverse("seo-onboarding-submit"))
    assert response.status_code == 400

    client.patch(
        reverse("seo-onboarding"),
        {
            "website_url": "https://peak.example",
            "search_console_property": "sc-domain:peak.example",
            "primary_location": "Perth",
            "target_keywords": "vespa perth",
        },
        content_type="application/json",
    )
    ok = client.post(reverse("seo-onboarding-submit"))
    assert ok.status_code == 200
    profile = SeoProfile.objects.get(subscriber=paid_seo_subscriber)
    assert profile.onboarding_status == SeoProfile.OnboardingStatus.SUBMITTED
    assert profile.submitted_at is not None
