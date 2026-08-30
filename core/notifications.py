import logging
from pathlib import Path

import requests
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone

from .models import Enquiry, Notification


logger = logging.getLogger(__name__)


def send_notification(notification: Notification, attachments=None) -> Notification:
    """Deliver one persisted notification and retain the result for the admin log."""
    if not settings.NOTIFICATIONS_ENABLED:
        notification.error_message = "Delivery is disabled until notification credentials are enabled."
        notification.save(update_fields=["error_message"])
        return notification

    try:
        if notification.channel == Notification.Channel.EMAIL:
            if not all([settings.MAILGUN_API_KEY, settings.MAILGUN_DOMAIN, notification.recipient]):
                raise ValueError("Mailgun or recipient email is not configured.")
            context = {"subject": notification.subject, "body": notification.body}
            files = [
                ("attachment", (Path(filename).name, content, mimetype))
                for filename, content, mimetype in (attachments or [])
            ]
            response = requests.post(
                f"https://api.mailgun.net/v3/{settings.MAILGUN_DOMAIN}/messages",
                auth=("api", settings.MAILGUN_API_KEY),
                data={
                    "from": settings.DEFAULT_FROM_EMAIL,
                    "to": [notification.recipient],
                    "subject": notification.subject or "Free the Desk notification",
                    "text": render_to_string("notifications/admin_notification.txt", context),
                    "html": render_to_string("notifications/admin_notification.html", context),
                },
                files=files or None,
                timeout=30 if files else 10,
            )
            response.raise_for_status()
        elif notification.channel == Notification.Channel.SMS:
            if not all([settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN, notification.recipient]):
                raise ValueError("Twilio or recipient phone number is not configured.")
            from twilio.rest import Client

            message_args = {"body": notification.body, "to": notification.recipient}
            if settings.TWILIO_MESSAGING_SERVICE_SID:
                message_args["messaging_service_sid"] = settings.TWILIO_MESSAGING_SERVICE_SID
            elif settings.TWILIO_PHONE_NUMBER:
                message_args["from_"] = settings.TWILIO_PHONE_NUMBER
            else:
                raise ValueError("A Twilio messaging service or sending number is required.")
            Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN).messages.create(**message_args)
        else:
            raise ValueError(f"Unknown notification channel: {notification.channel}")

        notification.status = Notification.Status.SENT
        notification.sent_at = timezone.now()
        notification.error_message = ""
    except Exception as error:
        logger.exception("Notification %s could not be delivered", notification.pk)
        notification.status = Notification.Status.FAILED
        notification.error_message = str(error)

    notification.save(update_fields=["status", "sent_at", "error_message"])
    return notification


def notify_admin_of_enquiry(enquiry: Enquiry) -> list[Notification]:
    dashboard_url = f"{settings.SITE_URL.rstrip('/')}/dashboard/enquiries/{enquiry.pk}"
    email_body = (
        f"A new enquiry has been submitted.\n\n"
        f"Business: {enquiry.business}\n"
        f"Contact: {enquiry.name}\n"
        f"Email: {enquiry.email}\n"
        f"Phone: {enquiry.phone or 'Not supplied'}\n"
        f"Website: {enquiry.website or 'Not supplied'}\n"
        f"Interested in: {enquiry.get_help_with_display()}\n\n"
        f"Message:\n{enquiry.message}\n\n"
        f"Open enquiry: {dashboard_url}"
    )
    sms_body = (
        f"New Free the Desk enquiry: {enquiry.business} — {enquiry.name}, "
        f"{enquiry.get_help_with_display()}. {dashboard_url}"
    )
    notifications = []
    for channel, recipient, subject, body in (
        (Notification.Channel.EMAIL, settings.ADMIN_EMAIL, f"New enquiry — {enquiry.business}", email_body),
        (Notification.Channel.SMS, settings.ADMIN_NUMBER, "", sms_body),
    ):
        notification = Notification.objects.create(
            recipient_type=Notification.RecipientType.ADMIN,
            recipient=recipient or "",
            channel=channel,
            subject=subject,
            body=body,
            related_enquiry=enquiry,
        )
        notifications.append(send_notification(notification))
    return notifications


def send_manual_email(*, to: str, subject: str, body: str, related_enquiry=None, attachments=None) -> Notification:
    notification = Notification.objects.create(
        recipient_type=Notification.RecipientType.MANUAL,
        recipient=to,
        channel=Notification.Channel.EMAIL,
        subject=subject,
        body=body,
        related_enquiry=related_enquiry,
    )
    return send_notification(notification, attachments=attachments)
