from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from ..models import Enquiry
from ..serializers import (
    AdminEnquirySerializer,
    AiReadinessEnquirySerializer,
    EnquirySerializer,
    ProjectEnquirySerializer,
)
from ..utils.notifications import notify_admin_of_enquiry
from ..utils.ordering import apply_ordering
from ..utils.pagination import DashboardPagination
from ..utils.throttles import EnquiryRateThrottle


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([EnquiryRateThrottle])
def create_enquiry(request):
    serializer = EnquirySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    enquiry = serializer.save()
    notify_admin_of_enquiry(enquiry)
    return Response({"status": "received"}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([EnquiryRateThrottle])
def create_ai_readiness_enquiry(request):
    serializer = AiReadinessEnquirySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    enquiry = serializer.save()
    notify_admin_of_enquiry(enquiry)
    return Response({"status": "received"}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([EnquiryRateThrottle])
def create_project_enquiry(request):
    serializer = ProjectEnquirySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    enquiry = serializer.save()
    notify_admin_of_enquiry(enquiry)
    return Response({"status": "received"}, status=status.HTTP_201_CREATED)


ENQUIRY_ORDERING = {
    "created_at": ("created_at",),
    "updated_at": ("updated_at",),
    "business": ("business",),
    "name": ("name",),
    "help_with": ("help_with",),
    "status": ("status",),
}


class AdminEnquiryListView(ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminEnquirySerializer
    pagination_class = DashboardPagination

    def get_queryset(self):
        params = self.request.query_params
        queryset = Enquiry.objects.all()
        for field in ("status", "help_with"):
            value = params.get(field, "").strip()
            if value:
                queryset = queryset.filter(**{f"{field}__in": [part.strip() for part in value.split(",") if part.strip()]})
        search = params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(business__icontains=search)
                | Q(email__icontains=search)
                | Q(phone__icontains=search)
                | Q(website__icontains=search)
                | Q(message__icontains=search)
            )
        return apply_ordering(queryset, params, ENQUIRY_ORDERING)


class AdminEnquiryDetailView(RetrieveUpdateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminEnquirySerializer
    queryset = Enquiry.objects.all()
    http_method_names = ["get", "patch", "head", "options"]
