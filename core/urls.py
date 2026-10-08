from django.urls import include, path
from freetheplatform.auth.views import (
    LoginView,
    LogoutView,
    PasswordChangeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    ProfileView,
    RefreshView,
)

from .views import (
    AdminEnquiryDetailView,
    AdminEnquiryListView,
    AdminInvoiceSettingsView,
    AdminPackageOrderDetailView,
    AdminPackageOrderListView,
    AdminSiteSettingsView,
    PackageOrderStatusView,
    PackageOrderView,
    create_ai_readiness_enquiry,
    create_project_enquiry,
    health_check,
    site_settings,
)


urlpatterns = [
    path("health/", health_check, name="health-check"),
    path("ai-readiness/", create_ai_readiness_enquiry, name="create-ai-readiness-enquiry"),
    path("project-enquiries/", create_project_enquiry, name="create-project-enquiry"),
    path("package-orders/", PackageOrderView.as_view(), name="create-package-order"),
    path(
        "package-orders/<str:reference>/",
        PackageOrderStatusView.as_view(),
        name="package-order-status",
    ),
    path("site-settings/", site_settings, name="site-settings"),
    path("admin/site-settings/", AdminSiteSettingsView.as_view(), name="admin-site-settings"),
    path("admin/invoice-settings/", AdminInvoiceSettingsView.as_view(), name="admin-invoice-settings"),
    # From the shared package; paths unchanged so the frontend/edge proxy are unaffected.
    path("token/", LoginView.as_view(), name="token"),
    path("token/refresh/", RefreshView.as_view(), name="token-refresh"),
    path("token/logout/", LogoutView.as_view(), name="token-logout"),
    path("auth/me/", ProfileView.as_view(), name="profile"),
    path("auth/password/change/", PasswordChangeView.as_view(), name="password-change"),
    path("auth/password/reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path(
        "auth/password/reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="password-reset-confirm",
    ),
    path("admin/enquiries/", AdminEnquiryListView.as_view(), name="admin-enquiry-list"),
    path("admin/enquiries/<int:pk>/", AdminEnquiryDetailView.as_view(), name="admin-enquiry-detail"),
    path("admin/package-orders/", AdminPackageOrderListView.as_view(), name="admin-package-order-list"),
    path(
        "admin/package-orders/<int:pk>/",
        AdminPackageOrderDetailView.as_view(),
        name="admin-package-order-detail",
    ),
    # From the shared package; path unchanged so dashboard URLs hold.
    path("admin/messages/", include("freetheplatform.messaging.api.urls")),
    path("admin/invoices/", include("freetheplatform.invoicing.api.urls")),
]
