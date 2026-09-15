from django.conf import settings

from freetheplatform.messaging import send_many

from ..models import Enquiry


def notify_admin_of_enquiry(enquiry: Enquiry):
    """Tell staff about a new enquiry, by email and SMS.

    The email carries the whole submission so nobody has to open the dashboard to
    triage it; the SMS is the short version with a link.
    """
    dashboard_url = f"{settings.SITE_URL.rstrip('/')}/dashboard/enquiries/{enquiry.pk}"
    enquiry_label = enquiry.business or enquiry.name
    contact_label = f"{enquiry.business} — {enquiry.name}" if enquiry.business else enquiry.name
    email_body = (
        f"A new enquiry has been submitted.\n\n"
        f"Business: {enquiry.business or 'Not supplied'}\n"
        f"Contact: {enquiry.name}\n"
        f"Email: {enquiry.email}\n"
        f"Phone: {enquiry.phone or 'Not supplied'}\n"
        f"Website: {enquiry.website or 'Not supplied'}\n"
        f"Interested in: {enquiry.get_help_with_display()}\n\n"
        f"Message:\n{enquiry.message}\n\n"
        f"Open enquiry: {dashboard_url}"
    )
    sms_body = (
        f"New freethedesk enquiry: {contact_label}, "
        f"{enquiry.get_help_with_display()}. {dashboard_url}"
    )
    return send_many(
        [
            {
                "channel": "email",
                "to": settings.ADMIN_EMAIL,
                "subject": f"New enquiry — {enquiry_label}",
                "body": email_body,
            },
            {"channel": "sms", "to": settings.ADMIN_NUMBER, "body": sms_body},
        ],
        message_type="enquiry.admin_new",
        related=enquiry,
    )
