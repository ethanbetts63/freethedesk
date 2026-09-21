from django.urls import path

from .views import (
    AdminDealerDetailView,
    AdminDealerListView,
    DealerOnboardingSubmitView,
    DealerOnboardingView,
    DealerProfileView,
    DealerRegistrationView,
    DealerSpecialConditionsView,
    DealerTradingView,
)


urlpatterns = [
    path("dealers/signup/", DealerRegistrationView.as_view(), name="dealer-signup"),
    path("dealers/me/", DealerProfileView.as_view(), name="dealer-profile"),
    path("dealers/onboarding/", DealerOnboardingView.as_view(), name="dealer-onboarding"),
    path("dealers/onboarding/submit/", DealerOnboardingSubmitView.as_view(), name="dealer-onboarding-submit"),
    path("dealers/trading/", DealerTradingView.as_view(), name="dealer-trading"),
    path(
        "dealers/special-conditions/",
        DealerSpecialConditionsView.as_view(),
        name="dealer-special-conditions",
    ),
    path("admin/dealers/", AdminDealerListView.as_view(), name="admin-dealer-list"),
    path("admin/dealers/<int:pk>/", AdminDealerDetailView.as_view(), name="admin-dealer-detail"),
]
