from datetime import datetime, time, timedelta

import pytest
from django.core.cache import cache
from django.urls import reverse
from django.utils import timezone
from freetheplatform.messaging import Message

from seo.models import SeoCallBooking, SeoCallSettings
from seo.utils.call_slots import PERTH, available_slots, candidate_slots, perth_label

pytestmark = pytest.mark.django_db


@pytest.fixture(autouse=True)
def _clear_throttles():
    cache.clear()


def booking_data(starts_at, **overrides):
    return {
        "starts_at": starts_at.isoformat(),
        "name": "Sam Lee",
        "website": "https://www.peakplumbing.com.au",
        "phone": "0400 111 222",
        "email": "sam@peakplumbing.com.au",
        "notes": "Why we don't show on Maps.",
        "source": "/contact",
        **overrides,
    }


def book(api_client, starts_at, **overrides):
    return api_client.post(reverse("seo-call-booking"), booking_data(starts_at, **overrides), format="json")


# --- Which times are offered: the settings ---------------------------------------------------


def test_by_default_slots_are_weekday_half_hours_from_nine_to_five_three_days_out():
    now = datetime(2026, 11, 16, 10, 0, tzinfo=PERTH)  # A Monday.
    local = [slot.astimezone(PERTH) for slot in candidate_slots(now=now)]
    assert local[0] == datetime(2026, 11, 19, 10, 0, tzinfo=PERTH)
    assert {slot.weekday() for slot in local} == {0, 1, 2, 3, 4}
    assert min(slot.time() for slot in local) == time(9, 0)
    assert max(slot.time() for slot in local) == time(16, 30)
    assert all(slot.minute in (0, 30) for slot in local)


def test_the_settings_change_the_notice_the_hours_and_the_days():
    settings = SeoCallSettings.load()
    settings.booking_advance_notice = 7
    settings.start_time = time(13, 0)
    settings.end_time = time(15, 0)
    settings.monday = settings.tuesday = settings.wednesday = settings.thursday = settings.friday = False
    settings.saturday = True
    settings.save()
    now = datetime(2026, 11, 16, 10, 0, tzinfo=PERTH)
    local = [slot.astimezone(PERTH) for slot in candidate_slots(now=now)]
    assert local[0] == datetime(2026, 11, 28, 13, 0, tzinfo=PERTH)  # The first Saturday a week out.
    assert {slot.weekday() for slot in local} == {5}
    assert {slot.time() for slot in local} == {time(13, 0), time(13, 30), time(14, 0), time(14, 30)}


def test_the_slots_endpoint_lists_open_times(api_client):
    response = api_client.get(reverse("seo-call-slots"))
    assert response.status_code == 200
    assert response.data["timezone"] == "Australia/Perth" and response.data["minutes"] == 30
    assert response.data["slots"]


# --- Booking --------------------------------------------------------------------------------


def test_a_booking_emails_and_texts_the_owner_and_confirms_to_the_business(api_client, settings):
    settings.ADMIN_EMAIL = "owner@freethedesk.com.au"
    settings.ADMIN_NUMBER = "+61400000000"
    slot = available_slots()[0]
    response = book(api_client, slot)
    assert response.status_code == 201, response.data
    assert response.data["label"] == perth_label(slot)
    booking = SeoCallBooking.objects.get()
    assert booking.starts_at == slot and booking.status == SeoCallBooking.Status.BOOKED
    assert booking.site == "peakplumbing.com.au"
    owner = Message.objects.get(message_type="seo_call.owner_booked")
    text = Message.objects.get(message_type="seo_call.owner_booked_sms")
    business = Message.objects.get(message_type="seo_call.business_confirmed")
    assert owner.to == "owner@freethedesk.com.au" and "0400 111 222" in owner.body_text
    assert text.channel == "sms" and text.to == "+61400000000" and "peakplumbing.com.au" in text.body_text
    assert business.to == "sam@peakplumbing.com.au" and "0400 111 222" in business.body_text
    assert [a["name"] for a in business.attachments] == ["seo-review-call.ics"]


def test_a_booked_slot_leaves_the_list_and_cannot_be_booked_again(api_client):
    slot = available_slots()[0]
    assert book(api_client, slot).status_code == 201
    assert slot not in available_slots()
    again = book(api_client, slot, email="other@example.com")
    assert again.status_code == 400 and "starts_at" in again.data


def test_a_cancelled_booking_frees_its_slot(api_client):
    slot = available_slots()[0]
    book(api_client, slot)
    SeoCallBooking.objects.update(status=SeoCallBooking.Status.CANCELLED)
    assert slot in available_slots()


def test_a_time_inside_the_notice_is_refused(api_client):
    response = book(api_client, timezone.now() + timedelta(days=1))
    assert response.status_code == 400 and "starts_at" in response.data
    assert not SeoCallBooking.objects.exists()


def test_a_time_off_the_half_hour_grid_is_refused(api_client):
    response = book(api_client, available_slots()[0] + timedelta(minutes=10))
    assert response.status_code == 400 and "starts_at" in response.data


@pytest.mark.parametrize("field", ["name", "website", "phone", "email"])
def test_each_required_field_is_required(api_client, field):
    response = book(api_client, available_slots()[0], **{field: ""})
    assert response.status_code == 400 and field in response.data


def test_notes_are_optional(api_client):
    assert book(api_client, available_slots()[0], notes="").status_code == 201


# --- The dashboard --------------------------------------------------------------------------


def test_the_call_endpoints_are_staff_only(api_client):
    assert api_client.get(reverse("admin-seo-call-list")).status_code in (401, 403)
    assert api_client.get(reverse("admin-seo-call-settings")).status_code in (401, 403)


def test_staff_list_a_week_of_calls_and_mark_one_taken(api_client, staff_user):
    slot = available_slots()[0]
    book(api_client, slot)
    api_client.force_authenticate(staff_user)
    day = slot.astimezone(PERTH).date()
    week = api_client.get(reverse("admin-seo-call-list"), {"from": day.isoformat(), "to": (day + timedelta(days=7)).isoformat()})
    assert [row["site"] for row in week.data["results"]] == ["peakplumbing.com.au"]
    later = api_client.get(reverse("admin-seo-call-list"), {"from": (day + timedelta(days=1)).isoformat()})
    assert later.data["results"] == []
    pk = week.data["results"][0]["id"]
    response = api_client.patch(
        reverse("admin-seo-call-detail", args=[pk]), {"status": "done", "call_notes": "Wants Plus."}, format="json",
    )
    assert response.status_code == 200 and response.data["status_label"] == "Call taken"
    assert SeoCallBooking.objects.get().call_notes == "Wants Plus."


def test_staff_cannot_move_a_booking_by_editing_it(api_client, staff_user):
    slot = available_slots()[0]
    book(api_client, slot)
    api_client.force_authenticate(staff_user)
    pk = SeoCallBooking.objects.get().pk
    api_client.patch(reverse("admin-seo-call-detail", args=[pk]), {"starts_at": timezone.now().isoformat()}, format="json")
    assert SeoCallBooking.objects.get().starts_at == slot


def test_staff_change_the_call_settings(api_client, staff_user):
    api_client.force_authenticate(staff_user)
    response = api_client.patch(
        reverse("admin-seo-call-settings"),
        {"booking_advance_notice": 5, "start_time": "10:00", "end_time": "14:00", "saturday": True},
        format="json",
    )
    assert response.status_code == 200, response.data
    settings = SeoCallSettings.load()
    assert settings.booking_advance_notice == 5 and settings.start_time == time(10, 0) and settings.saturday


@pytest.mark.parametrize("payload, field", [
    ({"start_time": "14:00", "end_time": "14:00"}, "end_time"),
    ({"monday": False, "tuesday": False, "wednesday": False, "thursday": False, "friday": False}, "monday"),
])
def test_settings_that_would_offer_no_calls_are_refused(api_client, staff_user, payload, field):
    api_client.force_authenticate(staff_user)
    response = api_client.patch(reverse("admin-seo-call-settings"), payload, format="json")
    assert response.status_code == 400 and field in response.data
