from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from payments.utils.package_services import accept_current_package_offer
from payments.utils.services import PaymentConfigurationError

from ..models import PackageOrder
from ..serializers import (
    AdminPackageOrderSerializer,
    PackageOrderSerializer,
    PackageOrderStatusSerializer,
)
from ..utils.notifications import notify_staff_of_package_order
from ..utils.ordering import apply_ordering
from ..utils.pagination import DashboardPagination
from ..utils.security import client_ip
from ..utils.throttles import EnquiryRateThrottle


class PackageOrderView(APIView):
    """Record an order from a service page and hand back the reference its checkout runs on.

    The terms ticked on the form are recorded here, so checkout has an acceptance to charge
    against. Staff hear about every order, paid or not, so an abandoned checkout can be followed
    up.
    """

    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [EnquiryRateThrottle]

    def post(self, request):
        serializer = PackageOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                order = serializer.save()
                accept_current_package_offer(
                    order=order,
                    accepted_ip=client_ip(request),
                    user_agent=request.META.get("HTTP_USER_AGENT", ""),
                )
        except PaymentConfigurationError as error:
            return Response(
                {"detail": str(error), "code": error.code},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        notify_staff_of_package_order(order)
        return Response({"reference": order.checkout_reference}, status=status.HTTP_201_CREATED)


class PackageOrderStatusView(RetrieveAPIView):
    """Where an order's payment stands, by its checkout reference.

    The payment and confirmation pages run without a login, so the reference is all they hold.
    It answers what was bought and whether it is paid: nothing that identifies the buyer.
    """

    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_scope = "public"
    serializer_class = PackageOrderStatusSerializer

    def get_object(self):
        return get_object_or_404(PackageOrder, checkout_reference=self.kwargs["reference"])


PACKAGE_ORDER_ORDERING = {
    "created_at": ("created_at",),
    "package": ("package",),
    "payment_status": ("payment_status",),
    "price": ("price",),
}


class AdminPackageOrderListView(ListAPIView):
    throttle_scope = "staff"  # Runaway-client limit; access is gated by the permission class.
    permission_classes = [IsAdminUser]
    serializer_class = AdminPackageOrderSerializer
    pagination_class = DashboardPagination

    def get_queryset(self):
        params = self.request.query_params
        queryset = PackageOrder.objects.all()
        for field in ("payment_status", "package"):
            value = params.get(field, "").strip()
            if value:
                queryset = queryset.filter(
                    **{f"{field}__in": [part.strip() for part in value.split(",") if part.strip()]}
                )
        search = params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search)
                | Q(business_name__icontains=search)
                | Q(phone__icontains=search)
                | Q(website__icontains=search)
                | Q(notes__icontains=search)
            )
        return apply_ordering(queryset, params, PACKAGE_ORDER_ORDERING)


class AdminPackageOrderDetailView(RetrieveAPIView):
    throttle_scope = "staff"  # Runaway-client limit; access is gated by the permission class.
    permission_classes = [IsAdminUser]
    serializer_class = AdminPackageOrderSerializer
    queryset = PackageOrder.objects.all()
