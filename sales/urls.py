"""Sale routes, dealer and customer.

Every customer route sits under ``sales/<reference>/`` so that the access
cookie's ``path`` covers all of them and nothing else. They take a ``customer/``
segment of their own rather than sharing the dealer's detail path: the two are
different views with different authentication and different serializers, and one
path cannot resolve to both.
"""

from django.urls import path

from identity.views import (
    DealerSaleIdentityImageView,
    DealerSaleIdentityReviewView,
    SaleIdentityImageView,
    SaleIdentitySubmitView,
    SaleIdentityUploadView,
)

from .views import (
    AccountSaleOpenView,
    AccountSalesView,
    DealerSaleDetailView,
    DealerSaleDocumentView,
    DealerSaleListView,
    DealerSaleSendView,
    DealerSaleWarrantyNoticeView,
    SaleDetailsView,
    SaleDocumentView,
    SaleLoginView,
    SaleOverviewView,
    SaleRedeemView,
    SaleWarrantyNoticeView,
    SaleWarrantyView,
)


urlpatterns = [
    # --- the customer's account, across dealers -----------------------------
    # Session-authenticated, so deliberately outside the ``sales/<reference>/``
    # tree the per-sale access cookie is scoped to.
    path("account/sales/", AccountSalesView.as_view(), name="account-sales"),
    path(
        "account/sales/<str:reference>/open/",
        AccountSaleOpenView.as_view(),
        name="account-sale-open",
    ),
    # --- the dealer ---------------------------------------------------------
    path("sales/", DealerSaleListView.as_view(), name="dealer-sale-list"),
    path("sales/<str:reference>/", DealerSaleDetailView.as_view(), name="dealer-sale-detail"),
    path("sales/<str:reference>/send/", DealerSaleSendView.as_view(), name="dealer-sale-send"),
    path(
        "sales/<str:reference>/warranty-notice/",
        DealerSaleWarrantyNoticeView.as_view(),
        name="dealer-sale-warranty-notice",
    ),
    path(
        "sales/<str:reference>/documents/<str:kind>/",
        DealerSaleDocumentView.as_view(),
        name="dealer-sale-document",
    ),
    path(
        "sales/<str:reference>/identity/<str:side>/",
        DealerSaleIdentityImageView.as_view(),
        name="dealer-sale-identity-image",
    ),
    path(
        "sales/<str:reference>/identity/<str:side>/review/",
        DealerSaleIdentityReviewView.as_view(),
        name="dealer-sale-identity-review",
    ),

    # --- the customer -------------------------------------------------------
    path("sales/<str:reference>/redeem/", SaleRedeemView.as_view(), name="sale-redeem"),
    path("sales/<str:reference>/login/", SaleLoginView.as_view(), name="sale-login"),
    path("sales/<str:reference>/customer/", SaleOverviewView.as_view(), name="sale-overview"),
    path(
        "sales/<str:reference>/customer/details/",
        SaleDetailsView.as_view(),
        name="sale-details",
    ),
    path(
        "sales/<str:reference>/customer/warranty/",
        SaleWarrantyView.as_view(),
        name="sale-warranty",
    ),
    path(
        "sales/<str:reference>/customer/warranty-notice/",
        SaleWarrantyNoticeView.as_view(),
        name="sale-warranty-notice",
    ),
    path(
        "sales/<str:reference>/customer/documents/<str:kind>/",
        SaleDocumentView.as_view(),
        name="sale-document",
    ),
    path(
        "sales/<str:reference>/customer/identity/submit/",
        SaleIdentitySubmitView.as_view(),
        name="sale-identity-submit",
    ),
    path(
        "sales/<str:reference>/customer/identity/<str:side>/",
        SaleIdentityUploadView.as_view(),
        name="sale-identity-upload",
    ),
    path(
        "sales/<str:reference>/customer/identity/<str:side>/image/",
        SaleIdentityImageView.as_view(),
        name="sale-identity-image",
    ),
]
