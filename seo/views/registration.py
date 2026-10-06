from django.db import transaction
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.utils.security import client_ip
from core.utils.throttles import SeoSignupRateThrottle
from payments.utils.seo_services import accept_current_seo_offer
from payments.utils.services import PaymentConfigurationError

from ..serializers import SeoRegistrationSerializer
from ..serializers.registration import ACCOUNT_EXISTS
from ..utils.notifications import notify_staff_of_seo_signup


class SeoRegistrationView(APIView):
    """Record an SEO signup and hand back the reference its checkout runs on.

    No login and no session: the account is made when payment lands
    (``activate_paid_subscriber``). The terms ticked on the form are recorded
    here, so checkout has an acceptance to charge against. Staff hear about
    every signup, paid or not, so an abandoned checkout can be followed up.
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
        try:
            with transaction.atomic():
                subscriber = serializer.save()
                accept_current_seo_offer(
                    subscriber=subscriber,
                    accepted_ip=client_ip(request),
                    user_agent=request.META.get("HTTP_USER_AGENT", ""),
                )
        except PaymentConfigurationError as error:
            return Response(
                {"detail": str(error), "code": error.code},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        notify_staff_of_seo_signup(subscriber)
        return Response(
            {"reference": subscriber.checkout_reference}, status=status.HTTP_201_CREATED
        )
