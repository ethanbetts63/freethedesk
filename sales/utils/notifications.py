"""What reaches the customer during a sale.

Through `freetheplatform.messaging` and a real template extending the shared
base, the way every other customer-facing email in the product does.
"""

from freetheplatform.messaging import send

from core.utils.urls import site_url

from .access import sale_link


def send_sale_link(sale, password, *, account_created=False):
    """The link, and the way back in on another device: the account.

    ``account_created``: this send just created the customer's account, and
    its first password is the one below — printed only in that case, because a
    returning customer's account keeps whatever password they already have and
    a fresh one here would be a lie. The reference+password sale login this
    email used to arm is retired.

    The plain password reaches this function once and is never stored.
    """
    link = sale_link(sale)
    login_url = f"{site_url()}/login"
    vehicle = " ".join(
        part for part in (str(sale.year or ""), sale.make, sale.model_name) if part
    )
    signing_back_in = (
        (
            f"Coming back on another device? Sign in to your FreeTheDesk account:\n\n"
            f"{login_url}\n"
            f"Email: {sale.customer_email}\n"
            f"Password: {password}\n\n"
            "You will be asked to choose your own password the first time you sign "
            "in. Your account shows this sale and any others.\n"
        )
        if account_created
        else (
            f"Coming back on another device? Sign in at {login_url} with this email "
            f"and your account password. Forgot it? Reset it from the sign-in page.\n"
        )
    )
    body = (
        f"Hello {sale.customer_name},\n\n"
        f"{sale.dealer.business_name} has started the paperwork for your "
        f"{vehicle or 'vehicle'}.\n\n"
        f"Open your sale: {link}\n\n"
        "That link signs you in on this device.\n\n"
        f"{signing_back_in}\n"
        f"Your reference is {sale.reference} — quote it if you need to contact "
        "the dealer.\n\n"
        "You will be asked for your licence details, some identity photos, and your "
        "signature. Nothing is binding until the dealer accepts your offer, and we "
        "will email you when they do."
    )
    return send(
        to=sale.customer_email,
        channel="email",
        message_type="sale.link",
        subject=f"Your vehicle paperwork — {sale.reference}",
        body=body,
        template="emails/sale_link",
        context={
            "sale": sale,
            "link": link,
            "login_url": login_url,
            "password": password if account_created else None,
            "vehicle": vehicle,
            "account_created": account_created,
        },
        related=sale,
    )
