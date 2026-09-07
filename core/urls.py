from django.urls import path

from .views import (
    AdminComposeMessageView,
    AdminEnquiryDetailView,
    AdminEnquiryListView,
    AdminNotificationDetailView,
    AdminNotificationListView,
    AdminSiteSettingsView,
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    LogoutView,
    ProfileView,
    create_enquiry,
    health_check,
    site_settings,
)


urlpatterns = [
    path("health/", health_check, name="health-check"),
    path("enquiries/", create_enquiry, name="create-enquiry"),
    path("site-settings/", site_settings, name="site-settings"),
    path("admin/site-settings/", AdminSiteSettingsView.as_view(), name="admin-site-settings"),
    path("token/", CookieTokenObtainPairView.as_view(), name="token"),
    path("token/refresh/", CookieTokenRefreshView.as_view(), name="token-refresh"),
    path("token/logout/", LogoutView.as_view(), name="token-logout"),
    path("auth/me/", ProfileView.as_view(), name="profile"),
    path("admin/enquiries/", AdminEnquiryListView.as_view(), name="admin-enquiry-list"),
    path("admin/enquiries/<int:pk>/", AdminEnquiryDetailView.as_view(), name="admin-enquiry-detail"),
    path("admin/messages/", AdminNotificationListView.as_view(), name="admin-message-list"),
    path("admin/messages/compose/", AdminComposeMessageView.as_view(), name="admin-message-compose"),
    path("admin/messages/<int:pk>/", AdminNotificationDetailView.as_view(), name="admin-message-detail"),
]
