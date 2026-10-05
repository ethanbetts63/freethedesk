from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from django.middleware.csrf import get_token
from freetheplatform.auth import lockout, revoke_all_sessions, set_auth_cookies
from freetheplatform.security import bounds
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from ..models import SeoSubscriber
from ..utils.password_claim import can_claim_password

UNAVAILABLE = {
    "detail": "This page can no longer set your password. "
    "Sign in with the temporary password we emailed you.",
    "code": "claim_unavailable",
}


class PasswordClaimSerializer(serializers.Serializer):
    claim = serializers.CharField(max_length=128)
    password = bounds.password(trim_whitespace=False)


class SeoPasswordClaimView(APIView):
    """Choose a paid signup's first password, and be signed in by doing so.

    Called by the confirmation page's Server Action, which forwards the token
    from the signup browser's cookie. Nobody is signed in until the password is
    set, so a session never exists on the temporary password alone. One answer
    for every refusal: a wrong token, an unknown reference and a closed window
    look the same.
    """

    authentication_classes = []
    permission_classes = [AllowAny]
    # Guessing a token is credential guessing.
    throttle_scope = "login"

    def post(self, request, reference):
        serializer = PasswordClaimSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(UNAVAILABLE, status=status.HTTP_403_FORBIDDEN)
        token = serializer.validated_data["claim"]
        password = serializer.validated_data["password"]

        with transaction.atomic():
            subscriber = (
                SeoSubscriber.objects.select_for_update()
                .select_related("user")
                .filter(checkout_reference=reference)
                .first()
            )
            if subscriber is None or not can_claim_password(subscriber, token):
                return Response(UNAVAILABLE, status=status.HTTP_403_FORBIDDEN)
            user = subscriber.user
            try:
                validate_password(password, user=user)
            except ValidationError as error:
                return Response(
                    {"password": list(error.messages)}, status=status.HTTP_400_BAD_REQUEST
                )

            user.set_password(password)
            user.save(update_fields=["password"])
            state = lockout.state_for(user)
            state.must_change_password = False
            state.save(update_fields=["must_change_password"])
            lockout.record_success(user)
            revoke_all_sessions(user)
            subscriber.password_claim_hash = ""
            subscriber.save(update_fields=["password_claim_hash", "updated_at"])

        refresh = RefreshToken.for_user(user)
        get_token(request)
        response = Response({"detail": "Password set."})
        set_auth_cookies(response, refresh.access_token, refresh)
        return response
