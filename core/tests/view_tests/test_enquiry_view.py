import pytest

from core.models import Enquiry, Notification
from core.tests.factories import EnquiryFactory

pytestmark = pytest.mark.django_db


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
