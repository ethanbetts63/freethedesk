import hmac

from django.conf import settings
from rest_framework import permissions


class IsInternalApiRequest(permissions.BasePermission):
    """The local machine uploading to the server, by shared secret.

    The header is compared in constant time, and an unset setting denies every
    request rather than matching an empty header. There is no account behind
    it: the endpoint does one thing and the secret is the whole credential.
    """

    def has_permission(self, request, view):
        expected = settings.INTERNAL_API_KEY or ""
        presented = request.headers.get("X-Internal-API-Key", "")
        return bool(expected) and hmac.compare_digest(presented, expected)
