import stripe
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from dealers.models import Dealer
from dealers.permissions import IsDealer

from .services import (
    PaymentConfigurationError,
    create_or_reuse_checkout_session,
    handle_checkout_session_completed,
    handle_invoice_payment,
    handle_subscription_changed,
)


class SubscriptionCheckoutView(APIView):
    permission_classes = [IsDealer]

    def post(self, request):
        try:
            with transaction.atomic():
                dealer = Dealer.objects.select_for_update().get(pk=request.user.dealer.pk)
                client_secret = create_or_reuse_checkout_session(dealer)
        except PaymentConfigurationError as error:
            message = str(error)
            if "confirmed" in message or "active" in message:
                code = status.HTTP_409_CONFLICT
            elif "does not require" in message:
                code = status.HTTP_400_BAD_REQUEST
            else:
                code = status.HTTP_503_SERVICE_UNAVAILABLE
            return Response({"detail": str(error)}, status=code)
        except stripe.StripeError:
            return Response(
                {"detail": "Stripe could not prepare payment. Please try again."},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        return Response({"client_secret": client_secret})


class SubscriptionTermsAcceptanceView(APIView):
    permission_classes = [IsDealer]

    def post(self, request):
        if request.data.get("accepted") is not True:
            return Response(
                {"detail": "You must accept the dealer subscription terms before payment."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        dealer = request.user.dealer
        if dealer.plan == Dealer.Plan.DEMO:
            return Response(
                {"detail": "The demo plan does not require subscription terms."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
        address = (forwarded.split(",")[0].strip() if forwarded else request.META.get("REMOTE_ADDR")) or None
        dealer.subscription_terms_version = settings.DEALER_TERMS_VERSION
        dealer.subscription_terms_accepted_at = timezone.now()
        dealer.subscription_terms_accepted_ip = address[:45] if address else None
        dealer.save(update_fields=[
            "subscription_terms_version", "subscription_terms_accepted_at",
            "subscription_terms_accepted_ip", "updated_at",
        ])
        return Response({"version": settings.DEALER_TERMS_VERSION, "accepted": True})


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

        event_type = event["type"]
        stripe_object = event["data"]["object"]
        if event_type == "checkout.session.completed":
            handle_checkout_session_completed(stripe_object)
        elif event_type in {"customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"}:
            handle_subscription_changed(stripe_object)
        elif event_type == "invoice.paid":
            handle_invoice_payment(stripe_object, succeeded=True)
        elif event_type == "invoice.payment_failed":
            handle_invoice_payment(stripe_object, succeeded=False)
        return Response({"status": "ok"})
