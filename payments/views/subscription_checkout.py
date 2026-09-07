import logging

import stripe
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.utils.security import client_ip
from dealers.utils.permissions import IsDealer

from ..utils.services import (
    PaymentConfigurationError,
    accept_current_offer,
    create_or_reuse_checkout_session,
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
