from rest_framework.permissions import BasePermission


class IsSeoSubscriber(BasePermission):
    """Signed in and attached to an SEO subscriber account, whatever its status.

    Status is deliberately not checked here: a pending or suspended subscriber
    still needs to reach the portal to be told where they stand. Operational
    views enforce their own payment requirements.
    """

    message = "An SEO account is required."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "seo_subscriber", None)
        )
