from rest_framework.permissions import BasePermission

class IsDealer(BasePermission):
    """Signed in and attached to a dealership, whatever its status.

    Status is deliberately not checked here: a pending or suspended dealer still
    needs to reach the portal to be told where they stand. Operational views
    enforce their own payment and verification requirements.
    """

    message = "A dealer account is required."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, "dealer", None))
