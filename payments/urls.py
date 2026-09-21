from django.urls import include, path

from .views import SeoSubscriptionCheckoutView, SubscriptionCheckoutView


app_name = "payments"

urlpatterns = [
    # The webhook comes from the package's own URLconf rather than being
    # mounted here by hand. Same path Stripe has always posted to, so this is
    # a deploy and not an edit to every endpoint in the Stripe dashboard --
    # and a route the package adds later arrives with it, instead of turning
    # up as a 404 nobody went looking for.
    path("", include("freetheplatform.payments.urls")),
    path("subscription/", SubscriptionCheckoutView.as_view(), name="subscription-checkout"),
    path("seo-subscription/", SeoSubscriptionCheckoutView.as_view(), name="seo-subscription-checkout"),
]
