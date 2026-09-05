from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from core.pagination import DashboardPagination
from core.throttles import DealerSignupRateThrottle

from .models import Dealer, DealerProfile
from .notifications import notify_staff_of_dealer_signup, send_dealer_welcome
from .permissions import IsDealer
from .serializers import (
    AdminDealerSerializer,
    DealerOnboardingSerializer,
    DealerRegistrationSerializer,
    DealerSelfSerializer,
)


class DealerRegistrationView(APIView):
    """Public dealer signup.

    No auth cookies are set. A dealer has nothing to log into until phase 2
    builds the portal, and issuing a session for an account that cannot be used
    would only produce a confusing dead end.
    """

    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [DealerSignupRateThrottle]

    def post(self, request):
        # Quiet honeypot, matching the enquiry form: bots get the same success
        # response without creating an account or triggering paid notifications.
        if (request.data.get("company_website") or "").strip():
            return Response({"status": "received"}, status=status.HTTP_201_CREATED)

        serializer = DealerRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        dealer = serializer.save()
        notify_staff_of_dealer_signup(dealer)
        send_dealer_welcome(dealer)
        return Response({"status": "received"}, status=status.HTTP_201_CREATED)


class DealerProfileView(RetrieveUpdateAPIView):
    """The signed-in dealer's own account."""

    permission_classes = [IsDealer]
    serializer_class = DealerSelfSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        return self.request.user.dealer


class DealerOnboardingView(RetrieveUpdateAPIView):
    """Extended dealership details, available only after a paid subscription activates."""

    permission_classes = [IsDealer]
    serializer_class = DealerOnboardingSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        dealer = self.request.user.dealer
        if dealer.payment_status != Dealer.PaymentStatus.ACTIVE:
            raise PermissionDenied("Complete payment before starting dealership setup.")
        profile, _ = DealerProfile.objects.get_or_create(
            dealer=dealer,
            defaults={"trading_name": dealer.business_name, "state": dealer.state, "phone": dealer.phone, "email": dealer.email},
        )
        return profile


class DealerOnboardingSubmitView(APIView):
    permission_classes = [IsDealer]

    required_fields = {
        "legal_name": "Legal business name",
        "trading_name": "Trading name",
        "dealer_licence_number": "Dealer licence (MD)",
        "organisation_code": "DoT organisation code",
        "abn": "ABN",
        "address_line1": "Street address",
        "suburb": "Suburb",
        "state": "State",
        "postcode": "Postcode",
        "phone": "Dealership phone",
        "email": "Dealership email",
        "authorised_officer_name": "Authorised officer",
        "authorised_officer_licence_number": "Officer licence number",
        "authorised_officer_date_of_birth": "Officer date of birth",
        "declared_at": "Declared at",
        "dealer_licence_document": "Dealer licence document",
        "authorised_officer_identity_document": "Authorised officer identity document",
        "business_evidence_document": "Business evidence document",
    }

    def post(self, request):
        dealer = request.user.dealer
        if dealer.payment_status != Dealer.PaymentStatus.ACTIVE:
            raise PermissionDenied("Complete payment before submitting dealership setup.")
        profile, _ = DealerProfile.objects.get_or_create(
            dealer=dealer,
            defaults={"trading_name": dealer.business_name, "state": dealer.state, "phone": dealer.phone, "email": dealer.email},
        )
        missing = [label for field, label in self.required_fields.items() if not getattr(profile, field)]
        if missing:
            raise ValidationError({"detail": f"Complete these fields before submitting: {', '.join(missing)}."})
        profile.verification_status = DealerProfile.VerificationStatus.SUBMITTED
        profile.submitted_at = timezone.now()
        profile.save(update_fields=["verification_status", "submitted_at", "updated_at"])
        return Response(DealerOnboardingSerializer(profile, context={"request": request}).data)


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
