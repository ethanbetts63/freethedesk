from django.db.models import Q
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from core.utils.ordering import apply_ordering
from core.utils.pagination import DashboardPagination
from core.utils.throttles import SeoCallRequestRateThrottle

from ..models import SeoCallRequest
from ..serializers.call_request import AdminSeoCallRequestSerializer, SeoCallRequestSerializer
from ..utils.call_requests import notify_owner_of_call_request

CALL_ORDERING = {
    "created_at": ("created_at",),
    "status": ("status",),
}


class SeoCallRequestView(APIView):
    """Ask for a call back. The owner is emailed and texted at once."""

    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [SeoCallRequestRateThrottle]

    def post(self, request):
        serializer = SeoCallRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        call_request = serializer.save()
        notify_owner_of_call_request(call_request)
        return Response({"status": "received"}, status=status.HTTP_201_CREATED)


class AdminSeoCallRequestListView(ListAPIView):
    throttle_scope = "staff"  # Runaway-client limit; access is gated by the permission class.
    permission_classes = [IsAdminUser]
    serializer_class = AdminSeoCallRequestSerializer
    pagination_class = DashboardPagination

    def get_queryset(self):
        params = self.request.query_params
        queryset = SeoCallRequest.objects.all()
        status_value = params.get("status", "").strip()
        if status_value:
            queryset = queryset.filter(status__in=[part for part in status_value.split(",") if part])
        search = params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(phone__icontains=search) | Q(website__icontains=search) | Q(notes__icontains=search)
            )
        return apply_ordering(queryset, params, CALL_ORDERING)


class AdminSeoCallRequestDetailView(RetrieveUpdateAPIView):
    throttle_scope = "staff"  # Runaway-client limit; access is gated by the permission class.
    permission_classes = [IsAdminUser]
    serializer_class = AdminSeoCallRequestSerializer
    queryset = SeoCallRequest.objects.all()
    http_method_names = ["get", "patch", "head", "options"]
