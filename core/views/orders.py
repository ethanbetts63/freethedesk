"""Everything bought online, in one list for staff.

Website packages (``PackageOrder``) and SEO audits (``SeoSubscriber``) are
different models with different detail pages, but to the person reading the
dashboard they are the same thing: money coming in. This view flattens both
into one row shape, so the Orders page is the one place to look. The rows are
few (every row is a sale), so they are merged and sorted in Python and paged
from the list.
"""

from decimal import Decimal

from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from freetheplatform.payments import Payment, PaymentStatus
from rest_framework.permissions import IsAdminUser
from rest_framework.views import APIView

from seo.models import SeoSubscriber

from ..models import PackageOrder, SiteSettings
from ..utils.pagination import DashboardPagination

PAID = "paid"
PENDING = "payment_pending"
STATUS_LABELS = {PAID: "Paid", PENDING: "Payment pending"}

KIND_PACKAGE = "package"
KIND_AUDIT = "audit"

SORT_KEYS = {
    "created_at": lambda row: row["created_at"],
    "product": lambda row: row["product_name"].lower(),
    "price": lambda row: Decimal(row["price"] or "0"),
    "payment_status": lambda row: row["payment_status"],
}


def _package_row(order: PackageOrder) -> dict:
    balance = order.balance
    return {
        "kind": KIND_PACKAGE,
        "id": order.pk,
        "created_at": order.created_at,
        "business_name": order.business_name,
        "email": order.email,
        "product_name": order.package_name,
        "price": str(order.price),
        "note": f"${balance:,.2f} due before launch" if balance > 0 else "",
        "payment_status": order.payment_status,
        "payment_status_label": order.get_payment_status_display(),
        "href": f"/dashboard/admin/orders/{order.pk}",
    }


def _audit_rows() -> list[dict]:
    """Every audit signup bar the complimentary ones, which are never revenue."""
    settings = SiteSettings.load()
    list_prices = {
        SeoSubscriber.Plan.ESSENTIALS: settings.seo_essentials_price,
        SeoSubscriber.Plan.PLUS: settings.seo_plus_price,
        SeoSubscriber.Plan.COMPLETE: settings.seo_complete_price,
    }
    content_type = ContentType.objects.get_for_model(SeoSubscriber)
    paid = {}
    for payment in (
        Payment.objects.filter(related_content_type=content_type, status=PaymentStatus.SUCCEEDED)
        .select_related("discount_redemption__discount")
        .order_by("created_at")
    ):
        paid[payment.related_object_id] = payment

    rows = []
    for subscriber in SeoSubscriber.objects.exclude(
        payment_status=SeoSubscriber.PaymentStatus.COMPLIMENTARY
    ):
        payment = paid.get(str(subscriber.pk))
        price = payment.total_amount if payment is not None else list_prices.get(subscriber.plan)
        note = ""
        if payment is not None and hasattr(payment, "discount_redemption"):
            redemption = payment.discount_redemption
            note = f"{redemption.discount.code} took ${redemption.amount:,.2f} off"
        status = PAID if subscriber.has_paid else PENDING
        rows.append({
            "kind": KIND_AUDIT,
            "id": subscriber.pk,
            "created_at": subscriber.created_at,
            "business_name": subscriber.business_name,
            "email": subscriber.email,
            "product_name": subscriber.get_plan_display(),
            "price": str(price) if price is not None else "",
            "note": note,
            "payment_status": status,
            "payment_status_label": STATUS_LABELS[status],
            "href": f"/dashboard/admin/seo/{subscriber.pk}",
        })
    return rows


class AdminOrderListView(APIView):
    throttle_scope = "staff"  # Runaway-client limit; access is gated by the permission class.
    permission_classes = [IsAdminUser]

    def get(self, request):
        params = request.query_params
        kinds = _values(params.get("kind", ""))
        statuses = _values(params.get("payment_status", ""))
        search = params.get("search", "").strip().lower()

        rows = []
        if not kinds or KIND_PACKAGE in kinds:
            package_filter = Q()
            if search:
                package_filter = (
                    Q(email__icontains=search)
                    | Q(business_name__icontains=search)
                    | Q(website__icontains=search)
                    | Q(notes__icontains=search)
                )
            rows += [_package_row(order) for order in PackageOrder.objects.filter(package_filter)]
        if not kinds or KIND_AUDIT in kinds:
            rows += [
                row
                for row in _audit_rows()
                if not search
                or search in row["business_name"].lower()
                or search in row["email"].lower()
            ]
        if statuses:
            rows = [row for row in rows if row["payment_status"] in statuses]

        ordering = params.get("ordering", "").strip() or "-created_at"
        key = SORT_KEYS.get(ordering.lstrip("-"), SORT_KEYS["created_at"])
        rows.sort(key=key, reverse=ordering.startswith("-"))

        paginator = DashboardPagination()
        page = paginator.paginate_queryset(rows, request, view=self)
        return paginator.get_paginated_response(page)


def _values(raw: str) -> set[str]:
    return {part.strip() for part in raw.split(",") if part.strip()}
