from django.urls import path

from .views import StripeWebhookView, SubscriptionCheckoutView


urlpatterns = [
    path("subscription/", SubscriptionCheckoutView.as_view(), name="subscription-checkout"),
    path("webhook/", StripeWebhookView.as_view(), name="stripe-webhook"),
]
