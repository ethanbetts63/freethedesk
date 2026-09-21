from django.conf import settings

from freetheplatform.messaging import send, send_many

from core.utils.urls import site_url

from ..models import SeoSubscriber


def _subscriber_url(subscriber: SeoSubscriber) -> str:
    return f"{site_url()}/dashboard/seo/{subscriber.pk}"


def notify_staff_of_seo_signup(subscriber: SeoSubscriber):
    """Tell us an SEO customer has signed up, by email and SMS."""
    subscriber_url = _subscriber_url(subscriber)
    is_gbp_audit = subscriber.report_type == SeoSubscriber.ReportType.GBP
    product_label = "Google Business Profile audit customer" if is_gbp_audit else "SEO customer"
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
        f"New freethedesk {subscriber.get_plan_display()} signup: {subscriber.business_name} — "
        f"{subscriber.contact_name}. {subscriber_url}"
    )
    return send_many(
        [
            {
                "channel": "email",
                "to": settings.ADMIN_EMAIL,
                "subject": f"New {subscriber.get_plan_display()} signup — {subscriber.business_name}",
                "body": email_body,
                "template": "emails/staff_seo_signup",
            },
            {"channel": "sms", "to": settings.ADMIN_NUMBER, "body": sms_body},
        ],
        message_type="seo.staff_signup",
        context={
            "subscriber": subscriber,
            "subscriber_url": subscriber_url,
            "is_gbp_audit": is_gbp_audit,
        },
        related=subscriber,
    )


def send_seo_welcome(subscriber: SeoSubscriber):
    """Confirm the lightweight account and point the customer to payment."""
    payment_url = f"{site_url()}/seo/payment"
    is_gbp_audit = subscriber.report_type == SeoSubscriber.ReportType.GBP
    next_step = (
        "Once Stripe confirms payment, you can send us your Google Business Profile link and business location."
        if is_gbp_audit
        else "Once Stripe confirms payment, you can connect your Search Console data and tell us what to focus the reporting on."
    )
    body = (
        f"Thanks, {subscriber.contact_name}. Your account for {subscriber.business_name} is saved.\n\n"
        f"Selected plan: {subscriber.get_plan_display()}\n"
        f"Payment: {payment_url}\n\n"
        f"{next_step}"
    )
    return send(
        to=subscriber.user.email,
        channel="email",
        message_type="seo.welcome",
        subject=f"Your freethedesk {'audit' if is_gbp_audit else 'SEO'} account is ready",
        body=body,
        template="emails/seo_welcome",
        context={"subscriber": subscriber, "payment_url": payment_url, "is_gbp_audit": is_gbp_audit},
        related=subscriber,
    )
