from django.conf import settings

from freetheplatform.messaging import send, send_many

from core.utils.urls import site_url

from ..models import SeoSetupStep, SeoSubscriber


def _subscriber_url(subscriber: SeoSubscriber) -> str:
    return f"{site_url()}/dashboard/admin/seo/{subscriber.pk}"


def notify_staff_of_seo_signup(subscriber: SeoSubscriber):
    """Tell us an SEO customer has signed up, by email and SMS."""
    subscriber_url = _subscriber_url(subscriber)
    email_body = (
        "A new SEO customer has signed up.\n\n"
        f"Business: {subscriber.business_name}\n"
        f"Contact: {subscriber.contact_name}\n"
        f"Email: {subscriber.email}\n"
        f"Phone: {subscriber.phone or 'Not supplied'}\n"
        f"Website: {subscriber.website or 'Not supplied'}\n"
        f"Plan: {subscriber.get_plan_display()}\n"
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
        },
        related=subscriber,
    )


def send_seo_welcome(subscriber: SeoSubscriber, password: str | None):
    """Payment is in: the customer's sign-in details and where setup lives.

    ``password`` is the temporary one minted at payment, or None when the account
    already had a password of its own. It reaches this function once; the
    account asks for a new one at first sign-in.
    """
    login_url = f"{site_url()}/login"
    setup_url = f"{site_url()}/seo-portal/setup"
    sign_in = (
        f"Email: {subscriber.email}\nTemporary password: {password}\n\n"
        "If you already chose a password after paying, sign in with that one; this "
        "temporary password no longer works. Otherwise you'll choose your own the "
        "first time you sign in."
        if password
        else f"Email: {subscriber.email}, with the password you already use."
    )
    body = (
        f"Thanks, payment for {subscriber.business_name} is confirmed.\n\n"
        f"Sign in to your SEO dashboard: {login_url}\n"
        f"{sign_in}\n\n"
        "The setup page walks you through giving us read-only access to Search Console and "
        "your other tools. Reporting starts once Search Console is connected.\n\n"
        f"Setup: {setup_url}"
    )
    return send(
        to=subscriber.email,
        channel="email",
        message_type="seo.welcome",
        subject="Your freethedesk SEO dashboard is ready",
        body=body,
        template="emails/seo_welcome",
        context={
            "subscriber": subscriber,
            "password": password,
            "login_url": login_url,
            "setup_url": setup_url,
        },
        related=subscriber,
    )


def notify_staff_of_duplicate_payment(subscriber: SeoSubscriber):
    """Money arrived for an email that already has an account.

    Checkout refuses such an email, so this is a race: the account appeared
    after checkout opened. There is no login to hand the purchase to, so it
    waits for a person to refund it or move it onto the existing account.
    """
    subscriber_url = _subscriber_url(subscriber)
    body = (
        f"A payment for {subscriber.business_name} has landed, but {subscriber.email} "
        "already has an account, so no new login was made and the signup is still pending.\n\n"
        "Refund it in Stripe, or move the purchase onto the existing account.\n"
        f"Open this signup: {subscriber_url}"
    )
    return send(
        to=settings.ADMIN_EMAIL,
        channel="email",
        message_type="seo.staff_duplicate_payment",
        subject=f"Payment needs sorting — {subscriber.business_name}",
        body=body,
        related=subscriber,
    )


def notify_staff_of_marked_step(step: SeoSetupStep):
    """A customer says they've done a step we have to confirm by looking."""
    subscriber = step.subscriber
    subscriber_url = _subscriber_url(subscriber)
    body = (
        f"{subscriber.business_name} has marked “{step.get_key_display()}” as done.\n\n"
        "Check the access arrived, then confirm the step on their page:\n"
        f"{subscriber_url}"
    )
    return send(
        to=settings.ADMIN_EMAIL,
        channel="email",
        message_type="seo.staff_setup_marked",
        subject=f"Confirm {step.get_key_display()} — {subscriber.business_name}",
        body=body,
        related=subscriber,
    )


def notify_staff_reporting_can_start(subscriber: SeoSubscriber):
    """Search Console is confirmed, which is all reporting needs."""
    subscriber_url = _subscriber_url(subscriber)
    profile = getattr(subscriber, "profile", None)
    found = profile.search_console_property if profile else ""
    body = (
        f"Search Console is connected for {subscriber.business_name}, so reporting can start.\n\n"
        f"Property: {found or 'Confirmed by staff'}\n"
        f"Open this customer: {subscriber_url}"
    )
    return send(
        to=settings.ADMIN_EMAIL,
        channel="email",
        message_type="seo.staff_reporting_ready",
        subject=f"Reporting can start — {subscriber.business_name}",
        body=body,
        related=subscriber,
    )
