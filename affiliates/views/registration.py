from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.utils.security import client_ip
from core.utils.throttles import AffiliateSignupRateThrottle
from payments.utils.agreements import AgreementConfigurationError

from ..serializers import ACCOUNT_EXISTS, AffiliateRegistrationSerializer
from ..utils.notifications import notify_staff_of_affiliate_signup, send_affiliate_welcome
from ..utils.services import AccountExists, register_affiliate


class AffiliateRegistrationView(APIView):
    """Open an affiliate account from the form on /affiliates.

    One request does all of it: the login, the discount code, the complimentary
    audit and the terms. No session is set; the verification code goes by
    email and the verify page spends it. Staff hear about every sign-up.
    """

    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [AffiliateSignupRateThrottle]

    def post(self, request):
        serializer = AffiliateRegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            email_errors = serializer.errors.get("email", [])
            if email_errors and getattr(email_errors[0], "code", "") == ACCOUNT_EXISTS:
                return Response(
                    {"detail": str(email_errors[0]), "code": ACCOUNT_EXISTS},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        try:
            affiliate, code = register_affiliate(
                contact_name=data["contact_name"],
                email=data["email"],
                business_name=data["business_name"],
                website=data.get("website", ""),
                accepted_ip=client_ip(request),
                user_agent=request.META.get("HTTP_USER_AGENT", ""),
            )
        except AccountExists:
            return Response(
                {"detail": "You already have an account with this email.", "code": ACCOUNT_EXISTS},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except AgreementConfigurationError as error:
            return Response({"detail": str(error)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        notify_staff_of_affiliate_signup(affiliate)
        send_affiliate_welcome(affiliate, code)
        return Response({"email": affiliate.email}, status=status.HTTP_201_CREATED)
