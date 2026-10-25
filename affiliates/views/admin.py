from django.db.models import Q
from django.utils import timezone
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAdminUser

from core.utils.ordering import apply_ordering
from core.utils.pagination import DashboardPagination

from ..models import Affiliate
from ..serializers import AdminAffiliateDetailSerializer, AdminAffiliateSerializer

AFFILIATE_ORDERING = {
    "created_at": ("created_at",),
    "updated_at": ("updated_at",),
    "business_name": ("business_name",),
    "contact_name": ("contact_name",),
    "status": ("status",),
}


class AdminAffiliateListView(ListAPIView):
    throttle_scope = "staff"  # Runaway-client limit; access is gated by the permission class.
    permission_classes = [IsAdminUser]
    serializer_class = AdminAffiliateSerializer
    pagination_class = DashboardPagination

    def get_queryset(self):
        params = self.request.query_params
        queryset = Affiliate.objects.select_related("user", "discount").prefetch_related("commissions")
        value = params.get("status", "").strip()
        if value:
            queryset = queryset.filter(status__in=[part.strip() for part in value.split(",") if part.strip()])
        search = params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(business_name__icontains=search)
                | Q(contact_name__icontains=search)
                | Q(email__icontains=search)
                | Q(discount__normalised_code__icontains=search.upper().replace(" ", ""))
            )
        return apply_ordering(queryset, params, AFFILIATE_ORDERING)


class AdminAffiliateDetailView(RetrieveUpdateAPIView):
    throttle_scope = "staff"  # Runaway-client limit; access is gated by the permission class.
    permission_classes = [IsAdminUser]
    serializer_class = AdminAffiliateDetailSerializer
    queryset = Affiliate.objects.select_related("user", "discount")
    http_method_names = ["get", "patch", "head", "options"]

    def perform_update(self, serializer):
        changing_status = (
            "status" in serializer.validated_data
            and serializer.validated_data["status"] != serializer.instance.status
        )
        affiliate = serializer.save(
            status_changed_at=timezone.now() if changing_status else serializer.instance.status_changed_at
        )
        # A suspended or denied affiliate's code stops working at checkout at
        # once; reinstating them turns it back on. The code row itself stays,
        # because paid audits point at it.
        if changing_status and affiliate.discount is not None:
            affiliate.discount.is_active = affiliate.is_active
            affiliate.discount.save(update_fields=["is_active", "updated_at"])
