from django.conf import settings
from rest_framework import exceptions
from rest_framework.authentication import CSRFCheck
from rest_framework_simplejwt.authentication import JWTAuthentication


def _enforce_csrf(request):
    check = CSRFCheck(get_response=lambda response: response)
    check.process_request(request)
    reason = check.process_view(request, None, (), {})
    if reason:
        raise exceptions.PermissionDenied(f"CSRF Failed: {reason}")


class CookieJWTAuthentication(JWTAuthentication):
    """Authenticate an HttpOnly access-token cookie and enforce CSRF on writes."""

    def authenticate(self, request):
        raw_token = request.COOKIES.get(settings.AUTH_COOKIE)
        if raw_token is None:
            return None
        validated_token = self.get_validated_token(raw_token)
        _enforce_csrf(request)
        return self.get_user(validated_token), validated_token
