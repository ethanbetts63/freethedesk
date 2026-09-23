"""A signed-in customer's view across all their sales.

The account (``Sale.account``, linked when the link is first sent) answers
"which sales are mine"; opening one still goes through the sale's own
path-scoped cookie, so the customer surface keeps exactly one way of
authorising requests. The bridge is ``open/``: prove the account session,
receive that sale's cookie.

An account session proves control of the email — its password only ever
travels by email — which is why it may mint sale cookies. The reverse would
not hold: a sale cookie can come from a link whose address the dealer mistyped,
so nothing here accepts one.

``all_objects`` on the same argument as ``sales.views.customer``: the account
is the scope, and a customer's sales deliberately cross dealers.

Mirrors ``allbikes/inventory/views/account_views.py``.
"""

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from sales.models import Sale
from sales.utils.access import access_has_ended, set_access_cookie


def _vehicle_label(sale):
    return " ".join(
        part for part in (str(sale.year or ""), sale.make, sale.model_name) if part
    ) or "Vehicle"


def _sale_card(sale):
    """Enough for a dashboard card; the sale page itself has the rest."""
    return {
        "reference": sale.reference,
        "vehicle": _vehicle_label(sale),
        "colour": sale.colour,
        "dealer_name": sale.dealer.business_name,
        "status": sale.status,
        "status_label": sale.get_status_display(),
        "created_at": sale.created_at,
        # Only cancellation closes access — a completed sale keeps serving the
        # download the customer wants six months later.
        "is_closed": access_has_ended(sale),
    }


class AccountSalesView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_scope = "portal"  # A customer acting on their own record.

    def get(self, request):
        sales = (
            Sale.all_objects.filter(account=request.user)
            .select_related("dealer")
            .order_by("-created_at")
        )
        return Response({"sales": [_sale_card(sale) for sale in sales]})


class AccountSaleOpenView(APIView):
    """Trade the account session for one sale's access cookie."""

    permission_classes = [IsAuthenticated]
    throttle_scope = "portal"  # A customer acting on their own record.

    def post(self, request, reference):
        sale = (
            Sale.all_objects.select_related("dealer")
            .filter(account=request.user, reference=reference)
            .first()
        )
        if sale is None:
            return Response({"detail": "Sale not found."}, status=404)
        if access_has_ended(sale):
            return Response({"detail": "This sale is closed."}, status=403)
        return set_access_cookie(Response({"reference": sale.reference}), sale)
