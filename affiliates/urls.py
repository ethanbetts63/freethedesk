from django.urls import path

from .views import (
    AdminAffiliateDetailView,
    AdminAffiliateListView,
    AffiliateAccountView,
    AffiliateRegistrationView,
)


urlpatterns = [
    path("affiliates/signup/", AffiliateRegistrationView.as_view(), name="affiliate-signup"),
    path("affiliates/me/", AffiliateAccountView.as_view(), name="affiliate-account"),
    path("admin/affiliates/", AdminAffiliateListView.as_view(), name="admin-affiliate-list"),
    path(
        "admin/affiliates/<int:pk>/",
        AdminAffiliateDetailView.as_view(),
        name="admin-affiliate-detail",
    ),
]
