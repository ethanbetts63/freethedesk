from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.utils.throttles import SeoSignupRateThrottle

from ..serializers import SeoRegistrationSerializer
from ..serializers.registration import ACCOUNT_EXISTS
from ..utils.notifications import notify_staff_of_seo_signup


class SeoRegistrationView(APIView):
    """Record an SEO signup and hand back the reference its checkout runs on.

    No login and no session: the account is made when payment lands
    (``activate_paid_subscriber``). Staff hear about every signup, paid or not,
    so an abandoned checkout can be followed up.
    """

    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [SeoSignupRateThrottle]

    def post(self, request):
        serializer = SeoRegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            email_errors = serializer.errors.get("email", [])
            if email_errors and getattr(email_errors[0], "code", "") == ACCOUNT_EXISTS:
                return Response(
                    {"detail": str(email_errors[0]), "code": ACCOUNT_EXISTS},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        subscriber = serializer.save()
        notify_staff_of_seo_signup(subscriber)
        return Response(
            {"reference": subscriber.checkout_reference}, status=status.HTTP_201_CREATED
        )
