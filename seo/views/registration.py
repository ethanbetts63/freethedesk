from django.middleware.csrf import get_token
from freetheplatform.auth.cookies import set_auth_cookies
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from core.principal import principal
from core.utils.throttles import SeoSignupRateThrottle

from ..serializers import SeoRegistrationSerializer
from ..utils.notifications import notify_staff_of_seo_signup


class SeoRegistrationView(APIView):
    """Create the basic SEO login before paid checkout.

    The customer hears from us once payment lands (``activate_paid_subscriber``);
    until then they are still on the checkout page.
    """

    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [SeoSignupRateThrottle]

    def post(self, request):
        serializer = SeoRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        subscriber = serializer.save()
        notify_staff_of_seo_signup(subscriber)
        # Registering signs them in on the same cookies login uses; CSRF token issued alongside.
        refresh = RefreshToken.for_user(subscriber.user)
        get_token(request)
        response = Response(principal(subscriber.user), status=status.HTTP_201_CREATED)
        set_auth_cookies(response, refresh.access_token, refresh)
        return response
