"""Telling the owner a business wants a call back: an email with everything it sent, and a text."""

from django.conf import settings
from freetheplatform.messaging import send

from core.utils.urls import site_url


def notify_owner_of_call_request(request):
    request_url = f"{site_url()}/dashboard/admin/calls/{request.pk}"
    send(
        channel="email",
        to=settings.ADMIN_EMAIL,
        subject=f"Call back: {request.site}",
        body=(
            "Someone wants a call back about SEO.\n\n"
            f"Phone: {request.phone}\n"
            f"Website: {request.website or 'Not given'}\n"
            f"Came from: {request.source or 'Not recorded'}\n\n"
            f"Notes:\n{request.notes or 'None'}\n\n"
            f"Open it: {request_url}"
        ),
        message_type="seo_call.requested",
        related=request,
    )
    send(
        channel="sms",
        to=settings.ADMIN_NUMBER,
        body=f"freethedesk call back: {request.phone}" + (f", {request.site}" if request.website else "") + f". {request_url}",
        message_type="seo_call.requested_sms",
        related=request,
    )
