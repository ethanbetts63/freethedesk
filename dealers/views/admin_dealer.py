from django.db.models import Q
from django.utils import timezone
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAdminUser

from core.utils.pagination import DashboardPagination

from ..models import Dealer
from ..serializers import AdminDealerSerializer

DEALER_ORDERING = {
    "created_at": ("created_at",),
    "updated_at": ("updated_at",),
    "business_name": ("business_name",),
    "contact_name": ("contact_name",),
    "status": ("status",),
}


class AdminDealerListView(ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminDealerSerializer
    pagination_class = DashboardPagination

    def get_queryset(self):
        params = self.request.query_params
        queryset = Dealer.objects.all()
        value = params.get("status", "").strip()
        if value:
            queryset = queryset.filter(status__in=[part.strip() for part in value.split(",") if part.strip()])
        search = params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(business_name__icontains=search)
                | Q(contact_name__icontains=search)
                | Q(email__icontains=search)
                | Q(phone__icontains=search)
            )
        ordering = params.get("ordering", "").strip() or "-created_at"
        descending = ordering.startswith("-")
        fields = DEALER_ORDERING.get(ordering.lstrip("-"), ("created_at",))
        if descending:
            fields = tuple(f"-{field}" for field in fields)
        return queryset.order_by(*fields, "-id")


class AdminDealerDetailView(RetrieveUpdateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminDealerSerializer
    queryset = Dealer.objects.all()
    http_method_names = ["get", "patch", "head", "options"]

    def perform_update(self, serializer):
        changing_status = (
            "status" in serializer.validated_data
            and serializer.validated_data["status"] != serializer.instance.status
        )
        serializer.save(status_changed_at=timezone.now() if changing_status else serializer.instance.status_changed_at)
