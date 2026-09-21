"""Sending the sale to the customer.

Its own module and its own throttle scope because it is the one dealer action
that costs something outside the request: it mints a credential and sends an
email. The same class of thing as an enquiry or a signup, and not the same class
as reading a queue.
"""

from django.db import transaction
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from core.utils.security import client_ip
from sales.models import Sale
from sales.serializers import DealerSaleSerializer
from sales.transitions import InvalidTransition, record, transition
from sales.utils.access import set_access_password
from sales.utils.notifications import send_sale_link

from .dealer import DealerSaleQuerysetMixin

#: What has to be true before a stranger is asked to fill in their licence
#: details against it. Not the whole sale — the customer supplies most of it —
#: but enough that the email makes sense and the documents can be built.
REQUIRED_TO_SEND = {
    "customer_name": "the customer's name",
    "customer_email": "the customer's email address",
    "condition": "whether the vehicle is new, used or a demonstrator",
    "make": "the make",
    "model_name": "the model",
    "vehicle_price": "the price",
}


class DealerSaleSendView(DealerSaleQuerysetMixin, APIView):
    """Mint the password, email the link, and hand the sale to the customer."""

    throttle_scope = "sale-link"

    def post(self, request, reference):
        sale = self.dealer_sales().filter(reference=reference).first()
        if sale is None:
            return Response({"detail": "Not found."}, status=404)

        missing = [label for field, label in REQUIRED_TO_SEND.items() if not getattr(sale, field)]
        if missing:
            return Response(
                {"detail": f"Fill in {', '.join(missing)} before sending this to the customer."},
                status=409,
            )

        resending = sale.status != Sale.Status.DRAFT

        try:
            with transaction.atomic():
                # A resend mints a new password rather than reusing the old one:
                # the plain text was shown once and cannot be recovered, so there
                # is nothing to resend except a fresh one. The access token is
                # deliberately unchanged — a customer who already has the link in
                # a browser must not be locked out by the dealer resending it.
                password = set_access_password(sale, save=False)
                sale.link_sent_at = timezone.now()
                sale.save(update_fields=["access_password_hash", "link_sent_at", "updated_at"])

                if not resending:
                    transition(
                        sale,
                        Sale.Status.AWAITING_CUSTOMER,
                        actor=request.user,
                        actor_label=request.user.get_username(),
                        ip_address=client_ip(request),
                        user_agent=request.META.get("HTTP_USER_AGENT", ""),
                    )
                else:
                    record(
                        sale,
                        "link.resent",
                        actor=request.user,
                        actor_label=request.user.get_username(),
                        ip_address=client_ip(request),
                        user_agent=request.META.get("HTTP_USER_AGENT", ""),
                    )
        except InvalidTransition as error:
            # Caught outside the block rather than inside it. Returning from
            # inside `atomic()` is an ordinary exit and commits, which would have
            # left a refused send holding a freshly minted password — locking the
            # customer out of a link they already had, for nothing.
            return Response({"detail": str(error)}, status=409)

        # Outside the transaction, deliberately. `deliver()` never raises — it
        # records FAILED on the message row — so this could not roll anything
        # back even if it were inside, and holding a write lock open across a
        # provider's HTTP call means their outage becomes ours.
        #
        # The consequence is real and accepted: a send that fails leaves a sale
        # marked sent with no email behind it. That is visible on the message row
        # and fixed by resending, which is the same button.
        send_sale_link(sale, password)
        return Response(DealerSaleSerializer(sale).data)
