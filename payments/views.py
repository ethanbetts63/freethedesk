import logging

import stripe
from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.security import client_ip
from dealers.permissions import IsDealer

from .services import (
    PaymentConfigurationError,
    accept_current_offer,
    create_or_reuse_checkout_session,
    process_stripe_event,
)


logger = logging.getLogger(__name__)


class SubscriptionCheckoutView(APIView):
    permission_classes = [IsDealer]

    def post(self, request):
        if request.data.get("accepted_terms") is not True:
            return Response(
                {"detail": "Accept the dealer subscription terms before continuing."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            dealer = request.user.dealer
            acceptance, quote = accept_current_offer(
                dealer=dealer,
                user=request.user,
                accepted_ip=client_ip(request),
            )
            client_secret = create_or_reuse_checkout_session(dealer, acceptance, quote)
        except PaymentConfigurationError as error:
            code = {
                "active": status.HTTP_409_CONFLICT,
                "confirmed": status.HTTP_409_CONFLICT,
                "demo": status.HTTP_400_BAD_REQUEST,
            }.get(error.code, status.HTTP_503_SERVICE_UNAVAILABLE)
            return Response({"detail": str(error)}, status=code)
        except stripe.StripeError as error:
            logger.exception("Stripe checkout preparation failed request_id=%s", getattr(error, "request_id", ""))
            return Response(
                {"detail": "Stripe could not prepare payment. Please try again."},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        return Response({
            "client_secret": client_secret,
            "monthly_price": str(quote.monthly_price),
            "currency": quote.currency.upper(),
            "terms_version": acceptance.terms_version,
        })


class StripeWebhookView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            event = stripe.Webhook.construct_event(
                request.body,
                request.META.get("HTTP_STRIPE_SIGNATURE", ""),
                settings.STRIPE_WEBHOOK_SECRET,
            )
        except (ValueError, stripe.SignatureVerificationError):
            return Response({"detail": "Invalid signature."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            outcome = process_stripe_event(event)
        except ValueError:
            return Response({"detail": "Invalid event."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"status": "ok", "outcome": outcome})
