from django.conf import settings

from freetheplatform.messaging import send, send_many

from ..models import Dealer


def _dealer_url(dealer: Dealer) -> str:
    return f"{settings.SITE_URL.rstrip('/')}/dashboard/dealers/{dealer.pk}"


def notify_staff_of_dealer_signup(dealer: Dealer):
    """Tell us a dealership has signed up, by email and SMS."""
    dealer_url = _dealer_url(dealer)
    email_body = (
        f"A new dealer has signed up.\n\n"
        f"Business: {dealer.business_name}\n"
        f"Contact: {dealer.contact_name}\n"
        f"Email: {dealer.user.email}\n"
        f"Phone: {dealer.phone or 'Not supplied'}\n"
        f"State: {dealer.get_state_display()}\n"
        f"Plan: {dealer.get_plan_display()}\n"
        f"Payment: {dealer.get_payment_status_display()}\n\n"
        f"Open this dealer: {dealer_url}"
    )
    sms_body = (
        f"New freethedesk dealer signup: {dealer.business_name} — {dealer.contact_name}. {dealer_url}"
    )
    return send_many(
        [
            {
                "channel": "email",
                "to": settings.ADMIN_EMAIL,
                "subject": f"New dealer signup — {dealer.business_name}",
                "body": email_body,
                "template": "emails/staff_dealer_signup",
            },
            {"channel": "sms", "to": settings.ADMIN_NUMBER, "body": sms_body},
        ],
        message_type="dealer.staff_signup",
        context={"dealer": dealer, "dealer_url": dealer_url},
        related=dealer,
    )


def send_dealer_welcome(dealer: Dealer):
    """Confirm the lightweight account and point the dealer to its next step."""
    payment_url = f"{settings.SITE_URL.rstrip('/')}/licensing/payment"
    body = (
        f"Thanks, {dealer.contact_name}. Your account for {dealer.business_name} is saved.\n\n"
        f"Selected plan: {dealer.get_plan_display()}\n"
        f"Payment: {payment_url}\n\n"
        "Once Stripe confirms payment, you can enter your licence and dealership details immediately. "
        "We verify those details before enabling live customer transactions."
    )
    return send(
        to=dealer.user.email,
        channel="email",
        message_type="dealer.welcome",
        subject="Your freethedesk account is ready",
        body=body,
        template="emails/dealer_welcome",
        context={"dealer": dealer, "payment_url": payment_url},
        related=dealer,
    )
