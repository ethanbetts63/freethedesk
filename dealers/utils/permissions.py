from rest_framework.permissions import BasePermission

from ..models import Dealer


class IsDealer(BasePermission):
    """Signed in and attached to a dealership, whatever its status.

    Status is deliberately not checked here: a pending or suspended dealer still
    needs to reach the portal to be told where they stand. Operational views
    enforce their own payment and verification requirements.
    """

    message = "A dealer account is required."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, "dealer", None))


class IsOperatingDealer(IsDealer):
    """Signed in, attached to a dealership, and cleared to trade.

    ``IsDealer`` deliberately lets a pending or suspended dealer reach the
    portal so it can tell them where they stand. Everything that produces a
    document in a customer's name needs more than that: the account has been
    approved and the subscription is paying.

    Checked here rather than per view because a route that forgets it is a route
    where a suspended dealership keeps generating contracts.
    """

    message = "Your dealership account is not active."

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        dealer = request.user.dealer
        return (
            dealer.status == Dealer.Status.ACTIVE
            and dealer.payment_status == Dealer.PaymentStatus.ACTIVE
        )
