import pytest
from django.core.cache import cache
from django.urls import reverse
from freetheplatform.messaging import Message

from seo.models import SeoCallRequest

pytestmark = pytest.mark.django_db


@pytest.fixture(autouse=True)
def _clear_throttles():
    cache.clear()


def ask(api_client, **fields):
    data = {"phone": "0400 111 222", "website": "https://www.peakplumbing.com.au", "notes": "Not on Maps.", "source": "/contact"}
    return api_client.post(reverse("seo-call-request"), {**data, **fields}, format="json")


def test_a_request_emails_and_texts_the_owner(api_client, settings):
    settings.ADMIN_EMAIL = "owner@freethedesk.com.au"
    settings.ADMIN_NUMBER = "+61400000000"
    assert ask(api_client).status_code == 201
    request = SeoCallRequest.objects.get()
    assert request.site == "peakplumbing.com.au" and request.status == SeoCallRequest.Status.NEW
    email = Message.objects.get(message_type="seo_call.requested")
    text = Message.objects.get(message_type="seo_call.requested_sms")
    assert email.to == "owner@freethedesk.com.au" and "0400 111 222" in email.body_text and "Not on Maps." in email.body_text
    assert text.channel == "sms" and text.to == "+61400000000" and "peakplumbing.com.au" in text.body_text


def test_only_the_phone_number_is_required(api_client):
    assert ask(api_client, website="", notes="").status_code == 201
    assert SeoCallRequest.objects.get().site == "0400 111 222"
    response = ask(api_client, phone="")
    assert response.status_code == 400 and "phone" in response.data


def test_the_call_request_endpoints_are_staff_only(api_client):
    assert api_client.get(reverse("admin-seo-call-list")).status_code in (401, 403)


def test_staff_list_requests_and_mark_one_called(api_client, staff_user):
    ask(api_client)
    api_client.force_authenticate(staff_user)
    rows = api_client.get(reverse("admin-seo-call-list"), {"status": "new"}).data["results"]
    assert [row["site"] for row in rows] == ["peakplumbing.com.au"]
    response = api_client.patch(
        reverse("admin-seo-call-detail", args=[rows[0]["id"]]),
        {"status": "called", "call_notes": "Wants Plus.", "phone": "0499 999 999"},
        format="json",
    )
    assert response.status_code == 200 and response.data["status_label"] == "Called"
    request = SeoCallRequest.objects.get()
    assert request.call_notes == "Wants Plus." and request.phone == "0400 111 222"
