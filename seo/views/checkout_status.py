from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import SeoSubscriber


class SeoCheckoutStatusView(APIView):
    """Where an SEO signup's payment stands, by its checkout reference.

    The payment page and the return-from-Stripe page run before any login
    exists, so the reference is all they hold. It answers only the plan and the
    payment state: nothing that identifies the person who signed up.
    """

    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_scope = "public"

    def get(self, request, reference):
        subscriber = get_object_or_404(SeoSubscriber, checkout_reference=reference)
        return Response({
            "plan": subscriber.plan,
            "payment_status": subscriber.payment_status,
            "paid": subscriber.has_paid,
        })
