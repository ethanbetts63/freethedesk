from urllib.parse import urlencode

from django.conf import settings
from freetheplatform.messaging import send, send_many

from core.utils.urls import site_url

from ..models import Affiliate, Commission

PORTAL_PATH = "/affiliate-portal"
VERIFY_PATH = "/affiliates/verify"


def _affiliate_url(affiliate: Affiliate) -> str:
    return f"{site_url()}/dashboard/admin/affiliates/{affiliate.pk}"


def notify_staff_of_affiliate_signup(affiliate: Affiliate):
    """Tell us a podcast host has joined, by email and SMS: their free audit is ours to write."""
    affiliate_url = _affiliate_url(affiliate)
    email_body = (
        "A podcast host has joined the affiliate program.\n\n"
        f"Podcast: {affiliate.business_name}\n"
        f"Host: {affiliate.contact_name}\n"
        f"Email: {affiliate.email}\n"
        f"Website: {affiliate.website or 'Not supplied'}\n"
        f"Code: {affiliate.code}\n\n"
        "Their free Plus audit is on the SEO list; it starts once they connect Search Console.\n\n"
        f"Open this affiliate: {affiliate_url}"
    )
    sms_body = (
        f"New freethedesk affiliate: {affiliate.business_name} — {affiliate.contact_name}. "
        f"{affiliate_url}"
    )
    return send_many(
        [
            {
                "channel": "email",
                "to": settings.ADMIN_EMAIL,
                "subject": f"New affiliate — {affiliate.business_name}",
                "body": email_body,
                "template": "emails/staff_affiliate_signup",
            },
            {"channel": "sms", "to": settings.ADMIN_NUMBER, "body": sms_body},
        ],
        message_type="affiliate.staff_signup",
        context={"affiliate": affiliate, "affiliate_url": affiliate_url},
        related=affiliate,
    )


def send_affiliate_welcome(affiliate: Affiliate, password: str | None):
    """The account is open: the verification code and where the portal is.

    ``password`` is the account's first password, presented as a verification
    code. Entering it on the verify page proves the address and replaces it.
    """
    login_url = f"{site_url()}/login"
    portal_url = f"{site_url()}{PORTAL_PATH}"
    # Encoded: a "+" in an address would otherwise arrive on the verify page as a space.
    verify_url = f"{site_url()}{VERIFY_PATH}?{urlencode({'email': affiliate.email})}"
    sign_in = (
        f"VERIFY YOUR EMAIL\n\nYour verification code: {password}\n\n"
        f"Enter it to verify your email, then choose a password:\n{verify_url}\n\n"
        f"After that, log in any time:\nUsername: {affiliate.email}\nLog in at: {login_url}"
        if password
        else f"Log in at: {login_url}\nUsername: {affiliate.email}, with the password you already use."
    )
    body = (
        f"Thanks, {affiliate.business_name} is in the affiliate program.\n\n"
        f"{sign_in}\n\n"
        f"Your code is {affiliate.code}. Your portal has it with a link your listeners can "
        "use, words for the show and the show notes, and the steps for your free audit.\n\n"
        f"Portal: {portal_url}"
    )
    return send(
        to=affiliate.email,
        channel="email",
        message_type="affiliate.welcome",
        subject="Your freethedesk affiliate account is ready",
        body=body,
        template="emails/affiliate_welcome",
        context={
            "affiliate": affiliate,
            "password": password,
            "verify_url": verify_url,
            "login_url": login_url,
            "portal_url": portal_url,
        },
        related=affiliate,
    )


def notify_of_commission(commission: Commission):
    """A listener bought an audit with the code: tell the affiliate and us."""
    affiliate = commission.affiliate
    amount = f"${commission.amount:,.2f}"
    portal_url = f"{site_url()}{PORTAL_PATH}"
    affiliate_url = _affiliate_url(affiliate)
    return send_many(
        [
            {
                "channel": "email",
                "to": affiliate.email,
                "subject": f"A listener bought an audit with {affiliate.code}",
                "body": (
                    f"Someone bought the {commission.description} with your code {affiliate.code}.\n\n"
                    f"That is {amount} to you, owed now and paid out through Stripe.\n\n"
                    f"Your portal lists every sale: {portal_url}"
                ),
                "template": "emails/affiliate_commission",
            },
            {
                "channel": "email",
                "to": settings.ADMIN_EMAIL,
                "subject": f"Affiliate sale — {affiliate.business_name} earned {amount}",
                "body": (
                    f"{commission.description} bought with {affiliate.code} "
                    f"({affiliate.business_name}).\n\n"
                    f"Sale: ${commission.sale_amount:,.2f}\nOwed to the affiliate: {amount}\n\n"
                    f"Open this affiliate: {affiliate_url}"
                ),
            },
        ],
        message_type="affiliate.commission",
        context={
            "commission": commission,
            "affiliate": affiliate,
            "amount": amount,
            "portal_url": portal_url,
        },
        related=affiliate,
    )
