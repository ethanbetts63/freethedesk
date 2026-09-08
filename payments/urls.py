from django.urls import path

from .views import SeoSubscriptionCheckoutView, StripeWebhookView, SubscriptionCheckoutView


urlpatterns = [
    path("subscription/", SubscriptionCheckoutView.as_view(), name="subscription-checkout"),
    path("seo-subscription/", SeoSubscriptionCheckoutView.as_view(), name="seo-subscription-checkout"),
    path("webhook/", StripeWebhookView.as_view(), name="stripe-webhook"),
]
