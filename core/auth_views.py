import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer

from .throttles import LoginRateThrottle


logger = logging.getLogger(__name__)


def principal_payload(user):
    """Describe whoever is signed in, for both portals.

    One shape rather than a staff endpoint and a near-identical dealer one. The
    frontend routes on ``role``; ``dealer`` is null for staff. ``is_staff`` is
    kept because the dashboard already reads it.
    """
    dealer = getattr(user, "dealer", None)
    return {
        "id": user.pk,
        "username": user.get_username(),
        "email": user.email,
        "is_staff": user.is_staff,
        "role": "staff" if user.is_staff else "dealer" if dealer is not None else "none",
        "dealer": None if dealer is None else {
            "id": dealer.pk,
            "business_name": dealer.business_name,
            "contact_name": dealer.contact_name,
            "status": dealer.status,
            "status_label": dealer.get_status_display(),
        },
    }


def _set_auth_cookies(response, access_token, refresh_token=None, request=None):
    if request is not None:
        get_token(request)
    secure = not settings.DEBUG
    response.set_cookie(
        settings.AUTH_COOKIE,
        str(access_token),
        max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
        httponly=True,
        secure=secure,
        samesite="Lax",
    )
    if refresh_token is not None:
        response.set_cookie(
            settings.AUTH_COOKIE_REFRESH,
            str(refresh_token),
            max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
            httponly=True,
            secure=secure,
            samesite="Lax",
        )


class CookieTokenObtainPairView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        identifier = (request.data.get("username") or request.data.get("email") or "").strip()
        password = request.data.get("password") or ""
        username = identifier
        if "@" in identifier:
            matched = get_user_model().objects.filter(email__iexact=identifier).first()
            if matched:
                username = matched.get_username()

        serializer = TokenObtainPairSerializer(
            data={"username": username, "password": password},
            context={"request": request},
        )
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            logger.warning("Portal login failed identifier=%s", identifier)
            return Response({"detail": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)

        user = serializer.user
        payload = principal_payload(user)
        if payload["role"] == "none":
            return Response(
                {"detail": "This account does not have portal access."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # A dealer awaiting approval, suspended or denied still signs in — the
        # portal shows them where they stand rather than a generic auth error.
        response = Response(payload)
        _set_auth_cookies(
            response,
            serializer.validated_data["access"],
            serializer.validated_data["refresh"],
            request=request,
        )
        return response


class CookieTokenRefreshView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get(settings.AUTH_COOKIE_REFRESH)
        if not refresh_token:
            return Response({"detail": "Refresh token not found."}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = TokenRefreshSerializer(data={"refresh": refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response({"detail": "Invalid or expired refresh token."}, status=status.HTTP_401_UNAUTHORIZED)
        response = Response({"detail": "Token refreshed."})
        _set_auth_cookies(response, serializer.validated_data["access"], serializer.validated_data.get("refresh"))
        return response


class LogoutView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        response = Response({"detail": "Logged out."})
        response.delete_cookie(settings.AUTH_COOKIE)
        response.delete_cookie(settings.AUTH_COOKIE_REFRESH)
        return response


class ProfileView(APIView):
    """Who am I. Serves both portals; the frontend gates on ``role``."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        payload = principal_payload(request.user)
        if payload["role"] == "none":
            return Response(
                {"detail": "This account does not have portal access."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return Response(payload)
