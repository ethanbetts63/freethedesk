from datetime import datetime, time

from django.db.models import Q
from django.utils.dateparse import parse_date
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from core.utils.ordering import apply_ordering
from core.utils.pagination import DashboardPagination
from core.utils.throttles import SeoCallBookingRateThrottle

from ..models import SeoCallBooking, SeoCallSettings
from ..serializers.call_booking import (
    AdminSeoCallBookingSerializer,
    SeoCallBookingSerializer,
    SeoCallSettingsSerializer,
)
from ..utils.call_emails import confirm_call_to_business, notify_owner_of_call
from ..utils.call_slots import CALL_LENGTH, PERTH, available_slots, perth_label

CALL_ORDERING = {
    "starts_at": ("starts_at",),
    "created_at": ("created_at",),
    "name": ("name",),
    "status": ("status",),
}


class SeoCallSlotsView(APIView):
    """The times the free SEO review call can be booked, in UTC ISO format, for the booking page to group by Perth day."""

    throttle_scope = "public"
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            "timezone": "Australia/Perth",
            "minutes": int(CALL_LENGTH.total_seconds() // 60),
            "slots": [slot.isoformat() for slot in available_slots()],
        })


class SeoCallBookingView(APIView):
    """Book a free SEO review call. Emails the owner and the business, each with a calendar file."""

    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [SeoCallBookingRateThrottle]

    def post(self, request):
        serializer = SeoCallBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        notify_owner_of_call(booking)
        confirm_call_to_business(booking)
        return Response(
            {"starts_at": booking.starts_at.isoformat(), "label": perth_label(booking.starts_at)},
            status=status.HTTP_201_CREATED,
        )


class AdminSeoCallBookingListView(ListAPIView):
    """The dashboard's diary and table. ``from`` and ``to`` (ISO dates, Perth) bound the diary's week."""

    throttle_scope = "staff"  # Runaway-client limit; access is gated by the permission class.
    permission_classes = [IsAdminUser]
    serializer_class = AdminSeoCallBookingSerializer
    pagination_class = DashboardPagination

    def get_queryset(self):
        params = self.request.query_params
        queryset = SeoCallBooking.objects.all()
        status_value = params.get("status", "").strip()
        if status_value:
            queryset = queryset.filter(status__in=[part for part in status_value.split(",") if part])
        for param, lookup in (("from", "starts_at__gte"), ("to", "starts_at__lt")):
            day = parse_date(params.get(param, "").strip() or "")
            if day:
                queryset = queryset.filter(**{lookup: datetime.combine(day, time.min, tzinfo=PERTH)})
        search = params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(email__icontains=search)
                | Q(phone__icontains=search) | Q(website__icontains=search) | Q(notes__icontains=search)
            )
        return apply_ordering(queryset, params, CALL_ORDERING)


class AdminSeoCallBookingDetailView(RetrieveUpdateAPIView):
    throttle_scope = "staff"  # Runaway-client limit; access is gated by the permission class.
    permission_classes = [IsAdminUser]
    serializer_class = AdminSeoCallBookingSerializer
    queryset = SeoCallBooking.objects.all()
    http_method_names = ["get", "patch", "head", "options"]


class AdminSeoCallSettingsView(APIView):
    throttle_scope = "staff"  # Runaway-client limit; access is gated by the permission class.
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(SeoCallSettingsSerializer(SeoCallSettings.load()).data)

    def patch(self, request):
        serializer = SeoCallSettingsSerializer(SeoCallSettings.load(), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
