from django.urls import include, path

from .views import (
    AdminEnquiryDetailView,
    AdminEnquiryListView,
    AdminSiteSettingsView,
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    LogoutView,
    ProfileView,
    create_ai_readiness_enquiry,
    create_enquiry,
    create_project_enquiry,
    health_check,
    site_settings,
)


urlpatterns = [
    path("health/", health_check, name="health-check"),
    path("enquiries/", create_enquiry, name="create-enquiry"),
    path("ai-readiness/", create_ai_readiness_enquiry, name="create-ai-readiness-enquiry"),
    path("project-enquiries/", create_project_enquiry, name="create-project-enquiry"),
    path("site-settings/", site_settings, name="site-settings"),
    path("admin/site-settings/", AdminSiteSettingsView.as_view(), name="admin-site-settings"),
    path("token/", CookieTokenObtainPairView.as_view(), name="token"),
    path("token/refresh/", CookieTokenRefreshView.as_view(), name="token-refresh"),
    path("token/logout/", LogoutView.as_view(), name="token-logout"),
    path("auth/me/", ProfileView.as_view(), name="profile"),
    path("admin/enquiries/", AdminEnquiryListView.as_view(), name="admin-enquiry-list"),
    path("admin/enquiries/<int:pk>/", AdminEnquiryDetailView.as_view(), name="admin-enquiry-detail"),
    # The message log, its compose endpoint and its per-message actions all come
    # from the shared package; the path is unchanged so the dashboard URLs hold.
    path("admin/messages/", include("freetheplatform.messaging.api.urls")),
]
