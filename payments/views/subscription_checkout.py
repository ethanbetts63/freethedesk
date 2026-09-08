import logging

import stripe
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.utils.security import client_ip
from dealers.utils.permissions import IsDealer
from seo.utils.permissions import IsSeoSubscriber

from ..utils.seo_services import (
    accept_current_seo_offer,
    create_or_reuse_seo_checkout_session,
)
from ..utils.services import (
    PaymentConfigurationError,
    accept_current_offer,
    create_or_reuse_checkout_session,
)

logger = logging.getLogger(__name__)

_CHECKOUT_ERROR_STATUS = {
    "active": status.HTTP_409_CONFLICT,
    "confirmed": status.HTTP_409_CONFLICT,
    "invalid_plan": status.HTTP_400_BAD_REQUEST,
}


def checkout_failure_response(error):
    """Map a checkout-preparation exception to a client-safe DRF ``Response``."""
    if isinstance(error, PaymentConfigurationError):
        code = _CHECKOUT_ERROR_STATUS.get(error.code, status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({"detail": str(error)}, status=code)
    logger.exception("Stripe checkout preparation failed request_id=%s", getattr(error, "request_id", ""))
    return Response(
        {"detail": "Stripe could not prepare payment. Please try again."},
        status=status.HTTP_502_BAD_GATEWAY,
    )


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
        except (PaymentConfigurationError, stripe.StripeError) as error:
            return checkout_failure_response(error)
        return Response({
            "client_secret": client_secret,
            "monthly_price": str(quote.monthly_price),
            "currency": quote.currency.upper(),
            "terms_version": acceptance.terms_version,
        })


class SeoSubscriptionCheckoutView(APIView):
    permission_classes = [IsSeoSubscriber]

    def post(self, request):
        if request.data.get("accepted_terms") is not True:
            return Response(
                {"detail": "Accept the SEO reporting and audit terms before continuing."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            subscriber = request.user.seo_subscriber
            acceptance, quote = accept_current_seo_offer(
                subscriber=subscriber,
                user=request.user,
                accepted_ip=client_ip(request),
            )
            client_secret = create_or_reuse_seo_checkout_session(subscriber, acceptance, quote)
        except (PaymentConfigurationError, stripe.StripeError) as error:
            return checkout_failure_response(error)
        return Response({
            "client_secret": client_secret,
            "price": str(quote.price),
            "currency": quote.currency.upper(),
            "cadence_label": quote.name,
            "mode": quote.mode,
            "terms_version": acceptance.terms_version,
        })
