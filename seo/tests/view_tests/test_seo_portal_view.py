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
    client.sign_in(seo_subscriber.user)
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


def test_subscriber_cannot_change_own_status_or_plan(client, seo_subscriber):
    client.sign_in(seo_subscriber.user)
    client.patch(
        reverse("seo-account"),
        {"status": "active", "plan": "monthly"},
        content_type="application/json",
    )
    seo_subscriber.refresh_from_db()
    assert seo_subscriber.status == SeoSubscriber.Status.PENDING
    assert seo_subscriber.plan == SeoSubscriber.Plan.QUARTERLY


def test_staff_cannot_use_the_seo_account_endpoint(client, seo_subscriber, staff_user):
    client.sign_in(staff_user)
    assert client.get(reverse("seo-account")).status_code == 403


def test_onboarding_requires_paid_status(client, seo_subscriber):
    client.sign_in(seo_subscriber.user)
    assert client.get(reverse("seo-onboarding")).status_code == 403


def test_paid_subscriber_can_save_the_brief(client, paid_seo_subscriber):
    client.sign_in(paid_seo_subscriber.user)
    response = client.patch(
        reverse("seo-onboarding"),
        {"target_keywords": "vespa perth", "primary_location": "Perth"},
        content_type="application/json",
    )
    assert response.status_code == 200
    profile = SeoProfile.objects.get(subscriber=paid_seo_subscriber)
    assert profile.target_keywords == "vespa perth"
    assert profile.primary_location == "Perth"


def test_the_brief_cannot_set_the_search_console_property(client, paid_seo_subscriber):
    # Only the Search Console check writes it, so it is always one we can read.
    client.sign_in(paid_seo_subscriber.user)
    client.patch(
        reverse("seo-onboarding"),
        {"search_console_property": "sc-domain:someone-else.example"},
        content_type="application/json",
    )
    assert SeoProfile.objects.get(subscriber=paid_seo_subscriber).search_console_property == ""
