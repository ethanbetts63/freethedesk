from rest_framework.permissions import BasePermission

from .models import Dealer


class IsDealer(BasePermission):
    """Signed in and attached to a dealership, whatever its status.

    Status is deliberately not checked here: a pending or suspended dealer still
    needs to reach the portal to be told where they stand. Views that require an
    approved account use :class:`IsActiveDealer`.
    """

    message = "A dealer account is required."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, "dealer", None))


class IsActiveDealer(IsDealer):
    message = "This dealer account is not active."

    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.dealer.status == Dealer.Status.ACTIVE
