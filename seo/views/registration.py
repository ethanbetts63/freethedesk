from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from core.utils.throttles import SeoSignupRateThrottle
from core.views.auth import _set_auth_cookies, principal_payload

from ..serializers import SeoRegistrationSerializer
from ..utils.notifications import notify_staff_of_seo_signup, send_seo_welcome


class SeoRegistrationView(APIView):
    """Create the basic SEO login before paid checkout."""

    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [SeoSignupRateThrottle]

    def post(self, request):
        serializer = SeoRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        subscriber = serializer.save()
        notify_staff_of_seo_signup(subscriber)
        send_seo_welcome(subscriber)
        refresh = RefreshToken.for_user(subscriber.user)
        response = Response(principal_payload(subscriber.user), status=status.HTTP_201_CREATED)
        _set_auth_cookies(response, refresh.access_token, refresh, request=request)
        return response
