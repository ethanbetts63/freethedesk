from django.urls import path

from .views.prospect_upload import UploadProspectsView
from .views.prospects import (
    AdminOutreachSummaryView,
    AdminProspectDetailView,
    AdminProspectListView,
    AdminProspectUnsubscribeView,
)
from .views.unsubscribe import UnsubscribeView

# The podcast outreach half of the app, mounted beside `urls.py` from config.

urlpatterns = [
    # The local machine, by shared secret.
    path("outreach/upload/", UploadProspectsView.as_view(), name="outreach-upload"),
    # The link in every pitch. Public, by signed token.
    path("outreach/unsubscribe/<str:token>/", UnsubscribeView.as_view(), name="outreach-unsubscribe"),
    # Staff.
    path("admin/outreach/prospects/", AdminProspectListView.as_view(), name="admin-prospect-list"),
    path("admin/outreach/prospects/<int:pk>/", AdminProspectDetailView.as_view(), name="admin-prospect-detail"),
    path(
        "admin/outreach/prospects/<int:pk>/unsubscribe/",
        AdminProspectUnsubscribeView.as_view(),
        name="admin-prospect-unsubscribe",
    ),
    path("admin/outreach/summary/", AdminOutreachSummaryView.as_view(), name="admin-outreach-summary"),
]
