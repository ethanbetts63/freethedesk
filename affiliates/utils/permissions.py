from rest_framework.permissions import BasePermission


class IsAffiliate(BasePermission):
    """Signed in and attached to an affiliate account, whatever its status.

    Status is deliberately not checked here: a suspended affiliate still
    reaches the portal to be told where they stand.
    """

    message = "An affiliate account is required."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "affiliate", None)
        )
