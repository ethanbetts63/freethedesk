from django.conf import settings

from freetheplatform.messaging import send, send_many

from core.utils.urls import site_url

from ..models import Enquiry, PackageOrder
from .package_pricing import dollars


def notify_admin_of_enquiry(enquiry: Enquiry):
    """Tell staff about a new enquiry, by email and SMS.

    The email carries the whole submission so nobody has to open the dashboard to
    triage it; the SMS is the short version with a link.
    """
    dashboard_url = f"{site_url()}/dashboard/enquiries/{enquiry.pk}"
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


def _order_url(order: PackageOrder) -> str:
    return f"{site_url()}/dashboard/admin/orders/{order.pk}"


def _order_summary(order: PackageOrder) -> str:
    return (
        f"Package: {order.package_name}\n"
        f"Price: {dollars(order.price)}, {dollars(order.due_now)} due upfront\n"
        f"Email: {order.email}\n"
        f"Phone: {order.phone or 'Not supplied'}\n"
        f"Website: {order.website or 'Not supplied'}\n"
        f"Notes: {order.notes or 'None'}\n"
    )


def notify_staff_of_package_order(order: PackageOrder):
    """Tell staff an order was placed, before it is paid, so an abandoned checkout can be chased.

    Email only: the SMS waits for the payment, which is the part worth interrupting someone for.
    """
    customer = order.business_name or order.email
    return send(
        channel="email",
        to=settings.ADMIN_EMAIL,
        subject=f"New order, awaiting payment — {order.package_name}, {customer}",
        body=(
            "A package was ordered and the customer has gone to pay.\n\n"
            f"{_order_summary(order)}\n"
            f"Open this order: {_order_url(order)}"
        ),
        message_type="package_order.staff_new",
        related=order,
    )


def notify_of_paid_package_order(order: PackageOrder):
    """Payment is in: staff by email and SMS, the customer by email, with what happens next."""
    order_url = _order_url(order)
    customer = order.business_name or order.email
    if order.balance:
        next_step = (
            "We'll be in touch to plan your site. The other half, "
            f"{dollars(order.balance)}, is invoiced before your site goes live."
        )
    else:
        next_step = "We'll be in touch to book your discovery session."
    return send_many(
        [
            {
                "channel": "email",
                "to": settings.ADMIN_EMAIL,
                "subject": f"Order paid — {order.package_name}, {customer}",
                "body": (
                    f"{dollars(order.due_now)} was paid for an order.\n\n"
                    f"{_order_summary(order)}\n"
                    f"Open this order: {order_url}"
                ),
            },
            {
                "channel": "sms",
                "to": settings.ADMIN_NUMBER,
                "body": (
                    f"freethedesk order paid: {order.package_name}, "
                    f"{dollars(order.due_now)}, {customer}. {order_url}"
                ),
            },
            {
                "channel": "email",
                "to": order.email,
                "subject": f"Payment received — your {order.package_name}",
                "body": (
                    "Thanks for your order.\n\n"
                    f"We've received {dollars(order.due_now)} for your {order.package_name}. "
                    f"{next_step}\n\n"
                    "Questions? Reply to this email.\n\n"
                    "freethedesk"
                ),
            },
        ],
        message_type="package_order.paid",
        related=order,
    )
