from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.utils.throttles import DealerSignupRateThrottle

from ..serializers import DealerRegistrationSerializer
from ..utils.notifications import notify_staff_of_dealer_signup, send_dealer_welcome


class DealerRegistrationView(APIView):
    """Create the basic dealer login before paid checkout."""

    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [DealerSignupRateThrottle]

    def post(self, request):
        serializer = DealerRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        dealer = serializer.save()
        notify_staff_of_dealer_signup(dealer)
        send_dealer_welcome(dealer)
        return Response({"status": "received"}, status=status.HTTP_201_CREATED)
