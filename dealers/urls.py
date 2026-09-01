from django.urls import path

from .views import AdminDealerDetailView, AdminDealerListView, DealerProfileView, DealerRegistrationView


urlpatterns = [
    path("dealers/signup/", DealerRegistrationView.as_view(), name="dealer-signup"),
    path("dealers/me/", DealerProfileView.as_view(), name="dealer-profile"),
    path("admin/dealers/", AdminDealerListView.as_view(), name="admin-dealer-list"),
    path("admin/dealers/<int:pk>/", AdminDealerDetailView.as_view(), name="admin-dealer-detail"),
]
