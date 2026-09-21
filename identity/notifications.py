"""Telling the customer an image came back.

One email, and its whole job is to carry the dealer's own sentence. A rejection
that says "verification failed" sends the customer back to guess which of three
photographs was the problem, which is how a sale stalls for a week over a blurry
corner.
"""

from freetheplatform.messaging import send

from core.utils.urls import site_url


def send_identity_rejected(sale, verification):
    link = f"{site_url()}/sale/{sale.reference}"
    outstanding = [sentence for _side, sentence in verification.outstanding()]
    body = (
        f"Hello {sale.customer_name},\n\n"
        f"{sale.dealer.business_name} has looked at the photos you sent and needs "
        "one or more of them again.\n\n"
        + "\n".join(f"- {sentence}" for sentence in outstanding)
        + "\n\n"
        f"Open your sale to send them: {link}\n\n"
        "Everything else you have done is saved. Only the photos listed above "
        "need doing again."
    )
    return send(
        to=sale.customer_email,
        channel="email",
        message_type="sale.identity_rejected",
        subject=f"One more photo needed — {sale.reference}",
        body=body,
        template="emails/identity_rejected",
        context={"sale": sale, "link": link, "outstanding": outstanding},
        related=sale,
    )
