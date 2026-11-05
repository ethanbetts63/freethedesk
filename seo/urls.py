from django.urls import path

from .views import (
    AdminSeoProspectDetailView,
    AdminSeoProspectListView,
    AdminSeoProspectSummaryView,
    AdminSeoProspectUnsubscribeView,
    SeoMessageSendView,
    SeoProspectFollowUpView,
    SeoProspectApproveView,
    SeoProspectHtmlView,
    SeoProspectUploadView,
    SeoReportPageView,
    SeoReportPdfView,
    AdminSeoSetupStepView,
    AdminSeoSubscriberDetailView,
    AdminSeoSubscriberListView,
    SeoAccountView,
    SeoCheckoutStatusView,
    SeoOnboardingView,
    SeoRegistrationView,
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
    path("seo/me/", SeoAccountView.as_view(), name="seo-account"),
    path("seo/onboarding/", SeoOnboardingView.as_view(), name="seo-onboarding"),
    path("seo/setup/", SeoSetupView.as_view(), name="seo-setup"),
    path("seo/setup/<str:key>/mark/", SeoSetupMarkView.as_view(), name="seo-setup-mark"),
    # The report pipeline, by shared secret: a published prospect report, held for the owner's approval.
    path("seo/prospects/", SeoProspectUploadView.as_view(), name="seo-prospect-upload"),
    # The same secret: the owner's word on a held report, after which the hourly run sends it.
    path("seo/prospects/approve/", SeoProspectApproveView.as_view(), name="seo-prospect-approve"),
    # The same secret: the one follow-up a week on, queued for the hourly send.
    path("seo/prospects/follow-up/", SeoProspectFollowUpView.as_view(), name="seo-prospect-follow-up"),
    # The same secret: the report page for a prospect already here (the rows from before the page existed).
    path("seo/prospects/html/", SeoProspectHtmlView.as_view(), name="seo-prospect-html"),
    # The same secret: one email written by hand, sent now, with files (the note after a call).
    path("seo/messages/", SeoMessageSendView.as_view(), name="seo-message-send"),
    # The report's link, which the site serves at /r/<token>: the page, and its PDF. No sign-in; the token is the key.
    path("seo/r/<str:token>/", SeoReportPageView.as_view(), name="seo-report-page"),
    path("seo/r/<str:token>/pdf/", SeoReportPdfView.as_view(), name="seo-report-pdf"),
    # Staff: the calls list.
    path("admin/seo/prospects/", AdminSeoProspectListView.as_view(), name="admin-seo-prospect-list"),
    path("admin/seo/prospects/summary/", AdminSeoProspectSummaryView.as_view(), name="admin-seo-prospect-summary"),
    path("admin/seo/prospects/<int:pk>/", AdminSeoProspectDetailView.as_view(), name="admin-seo-prospect-detail"),
    path(
        "admin/seo/prospects/<int:pk>/unsubscribe/",
        AdminSeoProspectUnsubscribeView.as_view(),
        name="admin-seo-prospect-unsubscribe",
    ),
    path("admin/seo/", AdminSeoSubscriberListView.as_view(), name="admin-seo-list"),
    path("admin/seo/<int:pk>/", AdminSeoSubscriberDetailView.as_view(), name="admin-seo-detail"),
    path(
        "admin/seo/<int:pk>/setup/<str:key>/",
        AdminSeoSetupStepView.as_view(),
        name="admin-seo-setup-step",
    ),
]
