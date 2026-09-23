"""What reaches the customer during a sale.

Through `freetheplatform.messaging` and a real template extending the shared
base, the way every other customer-facing email in the product does.
"""

from freetheplatform.messaging import send

from core.utils.urls import site_url

from .access import sale_link


def send_sale_link(sale, password, *, account_created=False):
    """The link, the reference and the password, in one email.

    The password is in the same email as the link on purpose. It is not a second
    factor — it is recovery for the day the customer opens the sale on their
    phone and finishes it on a laptop — and making them ask for it separately
    would mean a support conversation for something the link already grants.

    The plain password reaches this function once and is never stored. If the
    email fails, the dealer resends, which mints a new one.

    ``account_created``: this send just created the customer's account, whose
    first password is the same one below — worth a line, because "one password,
    two doors" is only obvious if somebody says it. A resend never repeats the
    claim: the sale password was re-minted but the account's was deliberately
    left alone.
    """
    link = sale_link(sale)
    login_url = f"{site_url()}/sale/{sale.reference}"
    account_url = f"{site_url()}/account"
    vehicle = " ".join(
        part for part in (str(sale.year or ""), sale.make, sale.model_name) if part
    )
    account_line = (
        f"This password also signs into your FreeTheDesk account at {account_url} — "
        f"all your paperwork in one place, and you can choose your own password "
        f"there.\n\n"
        if account_created
        else f"You can also see this sale in your account: {account_url}\n\n"
    )
    body = (
        f"Hello {sale.customer_name},\n\n"
        f"{sale.dealer.business_name} has started the paperwork for your "
        f"{vehicle or 'vehicle'}.\n\n"
        f"Open your sale: {link}\n\n"
        "That link signs you in on this device. If you need to pick it up somewhere "
        "else, go to:\n\n"
        f"{login_url}\n"
        f"Reference: {sale.reference}\n"
        f"Password: {password}\n\n"
        f"{account_line}"
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
            "password": password,
            "vehicle": vehicle,
            "account_created": account_created,
            "account_url": account_url,
        },
        related=sale,
    )
