from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.utils.throttles import SeoSignupRateThrottle

from ..serializers import SeoRegistrationSerializer
from ..utils.notifications import notify_staff_of_seo_signup, send_seo_welcome


class SeoRegistrationView(APIView):
    """Create the basic SEO login before paid checkout."""

    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [SeoSignupRateThrottle]

    def post(self, request):
        # Quiet honeypot, matching the enquiry form: bots get the same success
        # response without creating an account or triggering paid notifications.
        if (request.data.get("company_website") or "").strip():
            return Response({"status": "received"}, status=status.HTTP_201_CREATED)

        serializer = SeoRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        subscriber = serializer.save()
        notify_staff_of_seo_signup(subscriber)
        send_seo_welcome(subscriber)
        return Response({"status": "received"}, status=status.HTTP_201_CREATED)
