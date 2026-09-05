from django.urls import path

from .views import StripeWebhookView, SubscriptionCheckoutView, SubscriptionTermsAcceptanceView


urlpatterns = [
    path("subscription/", SubscriptionCheckoutView.as_view(), name="subscription-checkout"),
    path("subscription/terms/", SubscriptionTermsAcceptanceView.as_view(), name="subscription-terms-acceptance"),
    path("webhook/", StripeWebhookView.as_view(), name="stripe-webhook"),
]
