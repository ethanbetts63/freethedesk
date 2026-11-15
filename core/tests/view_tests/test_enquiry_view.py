import pytest
from django.core.cache import cache

from core.models import Enquiry
from core.tests.factories import EnquiryFactory, UserFactory

pytestmark = pytest.mark.django_db


@pytest.fixture(autouse=True)
def _clear_throttle_cache():
    # Enquiry endpoints share a 10/hour bucket that outlives a single test.
    cache.clear()


def test_free_ai_readiness_check_creates_a_tagged_enquiry(api_client, outbox):
    response = api_client.post(
        "/api/ai-readiness/",
        {
            "website": "https://www.example.com.au",
            "phone": "0400 000 000",
            "email": "owner@example.com.au",
        },
        format="json",
    )

    assert response.status_code == 201
    enquiry = Enquiry.objects.get()
    assert enquiry.help_with == Enquiry.HelpWith.AI_READINESS
    assert enquiry.business == "example.com.au"
    assert enquiry.website == "https://www.example.com.au"
    assert [message.channel for message in outbox] == ["email"]


def test_free_ai_readiness_check_accepts_a_submission_without_a_phone_number(api_client):
    response = api_client.post(
        "/api/ai-readiness/",
        {"website": "https://example.com.au", "email": "owner@example.com.au"},
        format="json",
    )

    assert response.status_code == 201
    assert Enquiry.objects.get().phone == ""


def test_free_ai_readiness_check_requires_a_website_and_email(api_client):
    response = api_client.post("/api/ai-readiness/", {"phone": "0400 000 000"}, format="json")

    assert response.status_code == 400
    assert {"website", "email"} <= response.json().keys()
    assert not Enquiry.objects.exists()


def test_enquiry_dashboard_requires_staff(api_client):
    response = api_client.get("/api/admin/enquiries/")
    assert response.status_code == 401


def test_staff_can_list_and_update_enquiries(api_client, staff_user):
    enquiry = EnquiryFactory(
        name="Alex Smith",
        business="Example Marine",
        email="alex@example.com",
        help_with="everything",
        message="We need a faster website and a better enquiry workflow.",
        configuration={"version": 1},
    )
    api_client.force_authenticate(staff_user)

    response = api_client.get("/api/admin/enquiries/?status=new")
    assert response.status_code == 200
    assert response.json()["count"] == 1
    assert response.json()["results"][0]["configuration"] == {"version": 1}

    response = api_client.patch(
        f"/api/admin/enquiries/{enquiry.pk}/",
        {"status": "contacted"},
        format="json",
    )
    assert response.status_code == 200
    enquiry.refresh_from_db()
    assert enquiry.status == "contacted"


def test_ignoring_an_enquiry_takes_it_off_the_new_list(api_client, staff_user):
    enquiry = EnquiryFactory()
    api_client.force_authenticate(staff_user)

    response = api_client.patch(f"/api/admin/enquiries/{enquiry.pk}/", {"status": "ignored"}, format="json")

    assert response.status_code == 200
    assert response.json()["status_label"] == "Ignored"
    assert api_client.get("/api/admin/enquiries/?status=new").json()["count"] == 0
    assert api_client.get("/api/admin/enquiries/?status=ignored").json()["count"] == 1


def test_only_staff_can_ignore_an_enquiry(api_client):
    enquiry = EnquiryFactory()
    api_client.force_authenticate(UserFactory())

    response = api_client.patch(f"/api/admin/enquiries/{enquiry.pk}/", {"status": "ignored"}, format="json")

    assert response.status_code == 403
    enquiry.refresh_from_db()
    assert enquiry.status == "new"


def test_the_retired_free_form_enquiry_endpoint_is_gone(api_client):
    """The dealership builder was its last caller, and it took any JSON from anyone."""
    response = api_client.post(
        "/api/enquiries/",
        {"email": "a@example.com", "help_with": "website", "message": "Hello there, friend"},
        format="json",
    )

    assert response.status_code == 404
    assert not Enquiry.objects.exists()


def test_the_retired_project_enquiry_endpoint_is_gone(api_client):
    """The free SEO review booking replaced the project enquiry form everywhere on 2026-11-15."""
    response = api_client.post(
        "/api/project-enquiries/",
        {"project_type": "seo", "email": "a@example.com", "notes": "Hello"},
        format="json",
    )

    assert response.status_code == 404
    assert not Enquiry.objects.exists()
