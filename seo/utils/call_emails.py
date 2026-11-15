"""What a booked SEO review call sends: an email and a text to the owner, and an email to the business.

The two emails carry an .ics file so the call lands in both calendars. The business is told what
happens next: the owner looks at its site, Maps position and Business Profile, then phones it
at the booked time.
"""

from datetime import UTC

from django.conf import settings
from django.utils import timezone
from freetheplatform.messaging import send

from core.utils.urls import site_url

from .call_slots import CALL_LENGTH, perth_label

ICS_STAMP = "%Y%m%dT%H%M%SZ"


def _ics_escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")


def call_ics(booking, summary: str, description: str) -> bytes:
    start = booking.starts_at.astimezone(UTC)
    end = start + CALL_LENGTH
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//freethedesk//SEO review call//EN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        f"UID:seo-call-{booking.pk}@freethedesk.com.au",
        f"DTSTAMP:{timezone.now().astimezone(UTC):{ICS_STAMP}}",
        f"DTSTART:{start:{ICS_STAMP}}",
        f"DTEND:{end:{ICS_STAMP}}",
        f"SUMMARY:{_ics_escape(summary)}",
        f"DESCRIPTION:{_ics_escape(description)}",
        "END:VEVENT",
        "END:VCALENDAR",
    ]
    return ("\r\n".join(lines) + "\r\n").encode()


def notify_owner_of_call(booking):
    """A booking is worth interrupting the owner for: an email with the details and the calendar file, and a text."""
    when = perth_label(booking.starts_at)
    who = booking.site
    booking_url = f"{site_url()}/dashboard/admin/calls/{booking.pk}"
    body = (
        "A free SEO review call has been booked.\n\n"
        f"When: {when}\n"
        f"Name: {booking.name}\n"
        f"Phone: {booking.phone}\n"
        f"Email: {booking.email}\n"
        f"Website: {booking.website}\n"
        f"Came from: {booking.source or 'Not recorded'}\n\n"
        f"Notes:\n{booking.notes or 'None'}\n\n"
        "Before the call: write their prospect report and pick its three main recommendations.\n\n"
        f"Open the booking: {booking_url}"
    )
    ics = call_ics(
        booking,
        f"SEO review call: {who} ({booking.phone})",
        f"Ring {booking.name} on {booking.phone}. Website: {booking.website}",
    )
    send(
        channel="email",
        to=settings.ADMIN_EMAIL,
        subject=f"SEO review call booked: {who}, {when}",
        body=body,
        attachments=[("seo-review-call.ics", ics, "text/calendar")],
        message_type="seo_call.owner_booked",
        related=booking,
    )
    send(
        channel="sms",
        to=settings.ADMIN_NUMBER,
        body=f"freethedesk SEO call booked: {who}, {when}. {booking.phone}. {booking_url}",
        message_type="seo_call.owner_booked_sms",
        related=booking,
    )


def confirm_call_to_business(booking):
    when = perth_label(booking.starts_at)
    body = (
        f"Hi {booking.name},\n\n"
        f"Your free 30-minute SEO review is booked for {when}. We'll ring you on {booking.phone}.\n\n"
        f"Before the call we'll look at {booking.website}: the site itself, where it shows on Google Maps "
        "and your Business Profile. On the call we'll go through the three things holding it back. "
        "You keep them whether or not you buy anything.\n\n"
        "There's nothing to prepare. If the time no longer suits, reply to this email and we'll move it.\n\n"
        "freethedesk"
    )
    ics = call_ics(
        booking,
        "Free SEO review call with freethedesk",
        f"We'll ring you on {booking.phone} to go through {booking.website}.",
    )
    return send(
        channel="email",
        to=booking.email,
        subject=f"Your free SEO review call: {when}",
        body=body,
        plain=True,
        attachments=[("seo-review-call.ics", ics, "text/calendar")],
        message_type="seo_call.business_confirmed",
        related=booking,
    )
