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
        f"Phone: {dealer.phone or 'Not supplied'}\n"
        f"State: {dealer.get_state_display()}\n"
        f"Plan: {dealer.get_plan_display()}\n"
        f"Payment: {dealer.get_payment_status_display()}\n\n"
        f"Open this dealer: {dealer_url}"
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
    """Confirm the lightweight account and point the dealer to its next step."""
    email, _ = resolve_recipient(Notification.RecipientType.DEALER, dealer=dealer)
    payment_url = f"{settings.SITE_URL.rstrip('/')}/licensing/payment"
    portal_url = f"{settings.SITE_URL.rstrip('/')}/portal/overview"
    if dealer.plan == Dealer.Plan.DEMO:
        body = (
            f"Thanks, {dealer.contact_name}. Your demo account for {dealer.business_name} is ready.\n\n"
            f"Open the dealer portal: {portal_url}\n\n"
            "Live customer transactions stay off until you choose a paid plan and complete verification."
        )
    else:
        body = (
            f"Thanks, {dealer.contact_name}. Your account for {dealer.business_name} is saved.\n\n"
            f"Selected plan: {dealer.get_plan_display()}\n"
            f"Continue to secure payment: {payment_url}\n\n"
            "Once Stripe confirms payment, you can enter your licence and dealership details immediately. "
            "We verify those details before enabling live customer transactions."
        )
    notification = Notification.objects.create(
        recipient_type=Notification.RecipientType.DEALER,
        recipient=email,
        channel=Notification.Channel.EMAIL,
        subject="Your Free the Desk account is ready",
        body=body,
        related_dealer=dealer,
    )
    return send_notification(
        notification,
        template="emails/dealer_welcome",
        context={"dealer": dealer, "payment_url": payment_url, "portal_url": portal_url},
    )
