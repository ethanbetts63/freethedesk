import stripe
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import PackageOrder

from ..utils.package_services import (
    create_or_reuse_package_checkout_session,
    order_package_acceptance,
)
from ..utils.services import PaymentConfigurationError
from .subscription_checkout import checkout_failure_response


class PackageOrderCheckoutView(APIView):
    """Open checkout for a package order, found by its checkout reference.

    Nobody signs in to buy a package, so the reference the order form handed back identifies the
    order. The terms were accepted on the form; checkout charges what is due now against that
    acceptance: half of a website, all of discovery.
    """

    # Creates a Stripe session per call, so this is a spend limit.
    throttle_scope = "checkout"
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        order = get_object_or_404(
            PackageOrder, checkout_reference=str(request.data.get("reference", ""))
        )
        try:
            acceptance, quote = order_package_acceptance(order)
            client_secret = create_or_reuse_package_checkout_session(order, acceptance, quote)
        except (PaymentConfigurationError, stripe.StripeError) as error:
            return checkout_failure_response(error)
        return Response({
            "client_secret": client_secret,
            "price": str(quote.price),
            "due_now": str(quote.due_now),
            "currency": quote.currency.upper(),
        })

