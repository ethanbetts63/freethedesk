import pytest
from django.core.cache import cache

from core.models import Enquiry, Notification
from core.tests.factories import EnquiryFactory

pytestmark = pytest.mark.django_db


@pytest.fixture(autouse=True)
def _clear_throttle_cache():
    # The enquiry endpoints share a 10/hour bucket held in the default cache,
    # which outlives a single test. Without this, tests start 429-ing once
    # enough of them have posted.
    cache.clear()


def test_enquiry_can_be_created(api_client):
    response = api_client.post(
        "/api/enquiries/",
        {
            "name": "Jane Dealer",
            "business": "Example Equipment",
            "email": "jane@example.com",
            "phone": "0400 000 000",
            "website": "https://example.com",
            "help_with": "website",
            "message": "Our inventory and parts enquiries need a better system.",
        },
        format="json",
    )

    assert response.status_code == 201
    assert Enquiry.objects.count() == 1
    assert Enquiry.objects.get().business == "Example Equipment"
    assert Notification.objects.count() == 2
    assert set(Notification.objects.values_list("channel", flat=True)) == {"email", "sms"}


def test_enquiry_can_be_created_without_business_or_phone(api_client):
    response = api_client.post(
        "/api/enquiries/",
        {
            "name": "Alex Owner",
            "email": "alex@example.com",
            "help_with": "automation",
            "message": "We want to automate our repeated order entry process.",
        },
        format="json",
    )

    assert response.status_code == 201
    enquiry = Enquiry.objects.get()
    assert enquiry.business == ""
    assert enquiry.phone == ""
    assert Notification.objects.count() == 2


def test_short_enquiry_message_is_rejected(api_client):
    response = api_client.post(
        "/api/enquiries/",
        {
            "name": "Jane Dealer",
            "business": "Example Equipment",
            "email": "jane@example.com",
            "help_with": "automation",
            "message": "Help",
        },
        format="json",
    )

    assert response.status_code == 400
    assert Enquiry.objects.count() == 0


def test_all_of_the_above_is_a_valid_enquiry_type(api_client):
    response = api_client.post(
        "/api/enquiries/",
        {
            "name": "Sam Dealer",
            "business": "Complete Dealer Group",
            "email": "sam@example.com",
            "help_with": "everything",
            "message": "We need the website and our internal workflows improved.",
        },
        format="json",
    )

    assert response.status_code == 201
    assert Enquiry.objects.get().help_with == "everything"


def test_website_builder_enquiry_stores_full_configuration(api_client):
    configuration = {
        "version": 1,
        "appearance": {
            "brand_name": "Northline",
            "current_url": "www.example.com.au",
            "accent": "blue",
            "accent_hex": "#247ec9",
        },
        "capabilities": [
            {"key": "inventory", "name": "Inventory catalogue", "selected": True},
            {"key": "service", "name": "Service bookings", "selected": False},
        ],
        "inventory_options": [
            {"key": "purchase", "name": "Buy online", "selected": True},
        ],
        "custom_capability": "Connect our existing stock feed.",
    }
    response = api_client.post(
        "/api/enquiries/",
        {
            "name": "Jane Dealer",
            "business": "Northline",
            "email": "jane@example.com",
            "phone": "0400 000 000",
            "website": "https://www.example.com.au",
            "help_with": "website_builder",
            "message": "Connect our existing stock feed.",
            "configuration": configuration,
        },
        format="json",
    )

    assert response.status_code == 201
    enquiry = Enquiry.objects.get()
    assert enquiry.get_help_with_display() == "Dealer web enquiry"
    assert enquiry.configuration == configuration


def test_honeypot_submission_is_quietly_discarded(api_client):
    response = api_client.post(
        "/api/enquiries/",
        {
            "name": "Automated Sender",
            "business": "Spam Company",
            "email": "spam@example.com",
            "help_with": "website",
            "message": "This looks real but the honeypot was completed.",
            "company_website": "https://spam.example.com",
        },
        format="json",
    )
    assert response.status_code == 201
    assert Enquiry.objects.count() == 0


def test_free_ai_readiness_check_creates_a_tagged_enquiry(api_client):
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
    assert Notification.objects.count() == 2


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


def test_project_enquiry_records_the_scope_and_budget(api_client):
    response = api_client.post(
        "/api/project-enquiries/",
        {
            "project_type": "both",
            "budget": "$3,000",
            "website": "https://www.example.com.au",
            "email": "owner@example.com.au",
            "phone": "0400 000 000",
        },
        format="json",
    )

    assert response.status_code == 201
    enquiry = Enquiry.objects.get()
    assert enquiry.help_with == Enquiry.HelpWith.EVERYTHING
    assert enquiry.business == "example.com.au"
    assert enquiry.configuration == {"project_type": "both", "budget": "$3,000"}
    assert "Budget: $3,000." in enquiry.message
    assert Notification.objects.count() == 2


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


def test_project_enquiry_honeypot_is_silently_discarded(api_client):
    response = api_client.post(
        "/api/project-enquiries/",
        {
            "project_type": "website",
            "budget": "$1,000",
            "website": "https://example.com.au",
            "email": "bot@example.com",
            "company_website": "filled in by a bot",
        },
        format="json",
    )

    assert response.status_code == 201
    assert Enquiry.objects.count() == 0


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
