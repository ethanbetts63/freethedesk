from django.urls import path

from .views import (
    AdminSeoSetupStepView,
    AdminSeoSubscriberDetailView,
    AdminSeoSubscriberListView,
    SeoAccountView,
    SeoCheckoutStatusView,
    SeoOnboardingView,
    SeoPasswordClaimView,
    SeoRegistrationView,
    SeoSetupCheckView,
    SeoSetupMarkView,
    SeoSetupView,
)


urlpatterns = [
    path("seo/signup/", SeoRegistrationView.as_view(), name="seo-signup"),
    path(
        "seo/checkout/<str:reference>/",
        SeoCheckoutStatusView.as_view(),
        name="seo-checkout-status",
    ),
    path(
        "seo/checkout/<str:reference>/password/",
        SeoPasswordClaimView.as_view(),
        name="seo-password-claim",
    ),
    path("seo/me/", SeoAccountView.as_view(), name="seo-account"),
    path("seo/onboarding/", SeoOnboardingView.as_view(), name="seo-onboarding"),
    path("seo/setup/", SeoSetupView.as_view(), name="seo-setup"),
    path("seo/setup/<str:key>/mark/", SeoSetupMarkView.as_view(), name="seo-setup-mark"),
    path("seo/setup/<str:key>/check/", SeoSetupCheckView.as_view(), name="seo-setup-check"),
    path("admin/seo/", AdminSeoSubscriberListView.as_view(), name="admin-seo-list"),
    path("admin/seo/<int:pk>/", AdminSeoSubscriberDetailView.as_view(), name="admin-seo-detail"),
    path(
        "admin/seo/<int:pk>/setup/<str:key>/",
        AdminSeoSetupStepView.as_view(),
        name="admin-seo-setup-step",
    ),
]
