import pytest
from django.core.cache import cache

from core.models import Enquiry, SiteSettings
from core.tests.factories import EnquiryFactory

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
    assert [message.channel for message in outbox] == ["email", "sms"]


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


def test_project_enquiry_records_the_scope_and_budget(api_client, outbox):
    response = api_client.post(
        "/api/project-enquiries/",
        {
            "project_type": "both",
            "budget": "$3,000",
            "website": "https://www.example.com.au",
            "email": "owner@example.com.au",
            "phone": "0400 000 000",
            "notes": "We want enquiries routed to different teams by location.",
        },
        format="json",
    )

    assert response.status_code == 201
    enquiry = Enquiry.objects.get()
    assert enquiry.help_with == Enquiry.HelpWith.EVERYTHING
    assert enquiry.business == "example.com.au"
    assert enquiry.configuration == {"project_type": "both", "budget": "$3,000"}
    assert "Budget: $3,000." in enquiry.message
    assert "Notes:\nWe want enquiries routed to different teams by location." in enquiry.message
    assert [message.channel for message in outbox] == ["email", "sms"]
    assert "example.com.au" in outbox[0].subject
    assert "We want enquiries routed to different teams by location." in outbox[0].body_text
    assert outbox[0].content_object == enquiry


def test_project_enquiry_accepts_a_custom_budget_without_a_phone_number(api_client):
    response = api_client.post(
        "/api/project-enquiries/",
        {
            "project_type": "automation",
            "budget": "Around 12k, flexible",
            "website": "https://example.com.au",
            "email": "owner@example.com.au",
        },
        format="json",
    )

    assert response.status_code == 201
    enquiry = Enquiry.objects.get()
    assert enquiry.help_with == Enquiry.HelpWith.AUTOMATION
    assert enquiry.phone == ""
    assert enquiry.configuration["budget"] == "Around 12k, flexible"
    assert "Notes:" not in enquiry.message


def test_project_enquiry_accepts_someone_with_no_website_yet(api_client):
    response = api_client.post(
        "/api/project-enquiries/",
        {
            "project_type": "website",
            "budget": "$5,000",
            "website": "",
            "email": "owner@example.com.au",
        },
        format="json",
    )

    assert response.status_code == 201
    enquiry = Enquiry.objects.get()
    assert enquiry.website == ""
    assert enquiry.business == ""


def test_project_enquiry_rejects_an_unknown_project_type(api_client):
    response = api_client.post(
        "/api/project-enquiries/",
        {
            "project_type": "spaceship",
            "budget": "$1,000",
            "website": "https://example.com.au",
            "email": "owner@example.com.au",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "project_type" in response.json()
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


def test_the_retired_free_form_enquiry_endpoint_is_gone(api_client):
    """The dealership builder was its last caller, and it took any JSON from anyone."""
    response = api_client.post(
        "/api/enquiries/",
        {"email": "a@example.com", "help_with": "website", "message": "Hello there, friend"},
        format="json",
    )

    assert response.status_code == 404
    assert not Enquiry.objects.exists()


def test_buying_a_website_package_records_the_admin_price(api_client, outbox):
    response = api_client.post(
        "/api/package-orders/",
        {
            "package": "website_small",
            "email": "owner@example.com.au",
            "phone": "0400 000 000",
            "website": "https://www.example.com.au",
            "notes": "We sell outdoor furniture.",
            # Ignored: the price comes from the admin, never the browser.
            "price": "1.00",
        },
        format="json",
    )

    assert response.status_code == 201
    enquiry = Enquiry.objects.get()
    assert enquiry.help_with == Enquiry.HelpWith.WEBSITE
    assert enquiry.configuration == {
        "package": "website_small",
        "package_name": "6-page website",
        "price": "3000.00",
    }
    assert enquiry.message.startswith("Bought the 6-page website package: $3,000, 6 pages at $500 a page.")
    assert "Notes:\nWe sell outdoor furniture." in enquiry.message
    assert [message.channel for message in outbox] == ["email", "sms"]


def test_the_large_package_follows_the_admin_settings(api_client):
    settings = SiteSettings.load()
    settings.website_large_pages = 12
    settings.website_large_page_price = "550.00"
    settings.save()

    response = api_client.post(
        "/api/package-orders/",
        {"package": "website_large", "email": "owner@example.com.au"},
        format="json",
    )

    assert response.status_code == 201
    enquiry = Enquiry.objects.get()
    assert enquiry.configuration["package_name"] == "12-page website"
    assert enquiry.configuration["price"] == "6600.00"
    assert enquiry.website == ""


def test_a_web_application_is_bought_as_its_discovery(api_client):
    response = api_client.post(
        "/api/package-orders/",
        {"package": "web_application", "email": "owner@example.com.au"},
        format="json",
    )

    assert response.status_code == 201
    enquiry = Enquiry.objects.get()
    assert enquiry.help_with == Enquiry.HelpWith.WEB_APPLICATION
    assert enquiry.configuration["price"] == "450.00"
    assert "discovery, 3 hours at $150 an hour" in enquiry.message


def test_an_unknown_package_is_refused(api_client):
    response = api_client.post(
        "/api/package-orders/",
        {"package": "website_connect", "email": "owner@example.com.au"},
        format="json",
    )

    assert response.status_code == 400
    assert "package" in response.json()
    assert not Enquiry.objects.exists()


def test_automation_discovery_is_an_automation_enquiry(api_client):
    response = api_client.post(
        "/api/package-orders/",
        {"package": "automation_discovery", "email": "owner@example.com.au"},
        format="json",
    )

    assert response.status_code == 201
    enquiry = Enquiry.objects.get()
    assert enquiry.help_with == Enquiry.HelpWith.AUTOMATION
    assert enquiry.configuration["package_name"] == "Automation discovery"
    assert enquiry.configuration["price"] == "450.00"
