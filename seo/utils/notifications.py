from django.conf import settings

from core.models import Notification
from core.utils.notifications import notify_admin_via_channels, resolve_recipient, send_notification

from ..models import SeoSubscriber


def _subscriber_url(subscriber: SeoSubscriber) -> str:
    return f"{settings.SITE_URL.rstrip('/')}/dashboard/seo/{subscriber.pk}"


def notify_staff_of_seo_signup(subscriber: SeoSubscriber) -> list[Notification]:
    """Tell us an SEO customer has signed up, by email and SMS.

    Mirrors ``dealers.utils.notifications.notify_staff_of_dealer_signup``.
    """
    subscriber_url = _subscriber_url(subscriber)
    product_label = (
        "Google Business Profile audit customer"
        if subscriber.report_type == SeoSubscriber.ReportType.GBP
        else "SEO customer"
    )
    email_body = (
        f"A new {product_label} has signed up.\n\n"
        f"Business: {subscriber.business_name}\n"
        f"Contact: {subscriber.contact_name}\n"
        f"Email: {subscriber.user.email}\n"
        f"Phone: {subscriber.phone or 'Not supplied'}\n"
        f"Website: {subscriber.website or 'Not supplied'}\n"
        f"Plan: {subscriber.get_plan_display()}\n"
        f"Report type: {subscriber.get_report_type_display()}\n"
        f"Payment: {subscriber.get_payment_status_display()}\n\n"
        f"Open this customer: {subscriber_url}"
    )
    sms_body = (
        f"New Free the Desk {subscriber.get_plan_display()} signup: {subscriber.business_name} — "
        f"{subscriber.contact_name}. {subscriber_url}"
    )

    email, phone = resolve_recipient(Notification.RecipientType.ADMIN)
    return notify_admin_via_channels(
        [
            (
                Notification.Channel.EMAIL,
                email,
                f"New {subscriber.get_plan_display()} signup — {subscriber.business_name}",
                email_body,
            ),
            (Notification.Channel.SMS, phone, "", sms_body),
        ],
        related_seo_subscriber=subscriber,
        template="emails/staff_seo_signup",
        context={
            "subscriber": subscriber,
            "subscriber_url": subscriber_url,
            "is_gbp_audit": subscriber.report_type == SeoSubscriber.ReportType.GBP,
        },
    )


def send_seo_welcome(subscriber: SeoSubscriber) -> Notification:
    """Confirm the lightweight account and point the customer to payment."""
    email, _ = resolve_recipient(Notification.RecipientType.SEO, subscriber=subscriber)
    payment_url = f"{settings.SITE_URL.rstrip('/')}/seo/payment"
    is_gbp_audit = subscriber.report_type == SeoSubscriber.ReportType.GBP
    next_step = (
        "Once Stripe confirms payment, you can send us your Google Business Profile link and business location."
        if is_gbp_audit
        else "Once Stripe confirms payment, you can connect your Search Console data and tell us what to focus the reporting on."
    )
    body = (
        f"Thanks, {subscriber.contact_name}. Your account for {subscriber.business_name} is saved.\n\n"
        f"Selected plan: {subscriber.get_plan_display()}\n"
        f"Continue to secure payment: {payment_url}\n\n"
        f"{next_step}"
    )
    notification = Notification.objects.create(
        recipient_type=Notification.RecipientType.SEO,
        recipient=email,
        channel=Notification.Channel.EMAIL,
        subject=f"Your Free the Desk {'audit' if is_gbp_audit else 'SEO'} account is ready",
        body=body,
        related_seo_subscriber=subscriber,
    )
    return send_notification(
        notification,
        template="emails/seo_welcome",
        context={"subscriber": subscriber, "payment_url": payment_url, "is_gbp_audit": is_gbp_audit},
    )
