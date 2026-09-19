from django.urls import path
from freetheplatform.payments.views import StripeWebhookView

from .views import SeoSubscriptionCheckoutView, SubscriptionCheckoutView


urlpatterns = [
    path("subscription/", SubscriptionCheckoutView.as_view(), name="subscription-checkout"),
    path("seo-subscription/", SeoSubscriptionCheckoutView.as_view(), name="seo-subscription-checkout"),
    # Same URL as before, so the Stripe endpoint configuration does not change.
    # The package verifies the signature, records the event once, and calls the
    # handlers registered in payments/flows.py.
    path("webhook/", StripeWebhookView.as_view(), name="stripe-webhook"),
]
