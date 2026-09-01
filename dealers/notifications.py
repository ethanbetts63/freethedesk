from django.conf import settings

from core.models import Notification
from core.notifications import resolve_recipient, send_notification

from .models import Dealer


def _dealer_url(dealer: Dealer) -> str:
    return f"{settings.SITE_URL.rstrip('/')}/dashboard/dealers/{dealer.pk}"


def notify_staff_of_dealer_signup(dealer: Dealer) -> list[Notification]:
    """Tell us a dealership has signed up, by email and SMS.

    Mirrors ``core.notifications.notify_admin_of_enquiry``: build the body once,
    persist a Notification per channel, send, record the outcome.
    """
    dealer_url = _dealer_url(dealer)
    email_body = (
        f"A new dealer has signed up.\n\n"
        f"Business: {dealer.business_name}\n"
        f"Contact: {dealer.contact_name}\n"
        f"Email: {dealer.email}\n"
        f"Phone: {dealer.phone or 'Not supplied'}\n\n"
        f"Review this dealer: {dealer_url}"
    )
    sms_body = f"New Free the Desk dealer signup: {dealer.business_name} — {dealer.contact_name}. {dealer_url}"

    email, phone = resolve_recipient(Notification.RecipientType.ADMIN)
    notifications = []
    for channel, recipient, subject, body in (
        (Notification.Channel.EMAIL, email, f"New dealer signup — {dealer.business_name}", email_body),
        (Notification.Channel.SMS, phone, "", sms_body),
    ):
        notification = Notification.objects.create(
            recipient_type=Notification.RecipientType.ADMIN,
            recipient=recipient,
            channel=channel,
            subject=subject,
            body=body,
            related_dealer=dealer,
        )
        notifications.append(
            send_notification(
                notification,
                template="emails/staff_dealer_signup",
                context={"dealer": dealer, "dealer_url": dealer_url},
            )
        )
    return notifications


def send_dealer_welcome(dealer: Dealer) -> Notification:
    """Acknowledge the signup so the dealer knows approval is a manual step."""
    email, _ = resolve_recipient(Notification.RecipientType.DEALER, dealer=dealer)
    notification = Notification.objects.create(
        recipient_type=Notification.RecipientType.DEALER,
        recipient=email,
        channel=Notification.Channel.EMAIL,
        subject="We have your Free the Desk application",
        body=(
            f"Thanks, {dealer.contact_name}. We have your application for "
            f"{dealer.business_name}.\n\n"
            "Every dealership is reviewed by hand before we switch an account on. "
            "That usually takes a business day. Once you are approved we will email "
            "you a link to finish setting up."
        ),
        related_dealer=dealer,
    )
    return send_notification(
        notification,
        template="emails/dealer_welcome",
        context={"dealer": dealer},
    )
