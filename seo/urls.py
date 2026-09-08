from django.urls import path

from .views import (
    AdminSeoSubscriberDetailView,
    AdminSeoSubscriberListView,
    SeoAccountView,
    SeoOnboardingSubmitView,
    SeoOnboardingView,
    SeoRegistrationView,
)


urlpatterns = [
    path("seo/signup/", SeoRegistrationView.as_view(), name="seo-signup"),
    path("seo/me/", SeoAccountView.as_view(), name="seo-account"),
    path("seo/onboarding/", SeoOnboardingView.as_view(), name="seo-onboarding"),
    path("seo/onboarding/submit/", SeoOnboardingSubmitView.as_view(), name="seo-onboarding-submit"),
    path("admin/seo/", AdminSeoSubscriberListView.as_view(), name="admin-seo-list"),
    path("admin/seo/<int:pk>/", AdminSeoSubscriberDetailView.as_view(), name="admin-seo-detail"),
]
