from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Dealer, DealerProfile
from ..serializers import DealerOnboardingSerializer
from ..utils.permissions import IsDealer
from ..utils.services import ensure_dealer_profile


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
        return ensure_dealer_profile(dealer)


class DealerOnboardingSubmitView(APIView):
    permission_classes = [IsDealer]

    required_fields = {
        "legal_name": "Legal business name",
        "dealer_licence_number": "Dealer licence (MD)",
        "organisation_code": "DoT organisation code",
        "abn": "ABN",
        "address_line1": "Street address",
        "suburb": "Suburb",
        "postcode": "Postcode",
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
        profile = ensure_dealer_profile(dealer)
        missing = [label for field, label in self.required_fields.items() if not getattr(profile, field)]
        dealer_required = {
            "business_name": "Trading name",
            "state": "State",
            "phone": "Dealership phone",
            "email": "Dealership email",
        }
        missing.extend(label for field, label in dealer_required.items() if not getattr(dealer, field))
        if missing:
            raise ValidationError({"detail": f"Complete these fields before submitting: {', '.join(missing)}."})
        profile.verification_status = DealerProfile.VerificationStatus.SUBMITTED
        profile.submitted_at = timezone.now()
        profile.save(update_fields=["verification_status", "submitted_at", "updated_at"])
        return Response(DealerOnboardingSerializer(profile, context={"request": request}).data)
