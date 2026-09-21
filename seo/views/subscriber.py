from freetheplatform.auth.passwords import apply_new_password
from freetheplatform.auth.throttling import PasswordChangeThrottle
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from ..serializers import SeoPasswordSerializer, SeoSelfSerializer
from ..utils.permissions import IsSeoSubscriber


class SeoAccountView(RetrieveUpdateAPIView):
    """The signed-in SEO customer's own account."""

    throttle_scope = "portal"  # A dealer or subscriber acting on their own record.

    permission_classes = [IsSeoSubscriber]
    serializer_class = SeoSelfSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        return self.request.user.seo_subscriber


class SeoPasswordView(APIView):
    """Choose the first password on an account that was created without one.

    Only the first. An account that already has a usable password changes it
    through `auth/password/change/`, which asks for the current one — without
    that check a stolen access token would be enough to take the account
    permanently, since setting a password ends every session including the
    owner's.

    Throttled for the same reason the change endpoint is: this is a write that
    can end sessions, and an unthrottled one is worth hammering.
    """

    permission_classes = [IsSeoSubscriber]
    throttle_classes = [PasswordChangeThrottle]

    def post(self, request):
        if request.user.has_usable_password():
            raise PermissionDenied("This account already has a password. Change it instead.")

        serializer = SeoPasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        # Via the package so this clears lockout counters and the must-change marker too, not just the hash.
        apply_new_password(request.user, serializer.validated_data["password"])
        return Response({"status": "password_set"}, status=status.HTTP_200_OK)
