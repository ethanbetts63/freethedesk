"""The dealer's Special Conditions, and the trading details beside them.

Both sit on `/portal/setup` and both are the dealer acting on their own record,
so both take the `portal` scope. They are separate endpoints because saving a
bank account and approving a set of contract terms are different acts — one
records an agreements acceptance and one does not.
"""

from django.db import transaction
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from core.utils.security import client_ip

from ..models import Dealer
from ..serializers.dealer_trading import DealerTradingSerializer
from ..serializers.special_conditions import (
    SpecialConditionChoicesSerializer,
    conditions_payload,
)
from ..utils.agreements import record_special_conditions_acceptance
from ..utils.permissions import IsDealer
from ..utils.services import ensure_dealer_profile


class DealerTradingView(RetrieveUpdateAPIView):
    """Bank details, signature and trading hours.

    Deliberately not locked while onboarding is under review. What that lock
    protects is the verification evidence somebody is currently reading; a bank
    account a dealer needs to correct is not that.
    """

    throttle_scope = "portal"  # A dealer or subscriber acting on their own record.

    permission_classes = [IsDealer]
    serializer_class = DealerTradingSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        return ensure_dealer_profile(self.request.user.dealer)


class DealerSpecialConditionsView(APIView):
    """Read every default clause in full; save which of them to keep.

    A dealer on the licensing-only plan sees none of this. They get the
    Authority to Lodge, which is not negotiable and has nothing to choose — so
    the screen would be a page of decisions about a document they never
    produce.
    """

    throttle_scope = "portal"  # A dealer or subscriber acting on their own record.

    permission_classes = [IsDealer]

    def get(self, request):
        return Response(conditions_payload(ensure_dealer_profile(request.user.dealer)))

    def put(self, request):
        dealer = request.user.dealer
        if dealer.plan == Dealer.Plan.LICENSING:
            return Response(
                {
                    "detail": "Your plan does not produce a sale contract, so there "
                    "are no special conditions to set."
                },
                status=409,
            )

        serializer = SpecialConditionChoicesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile = ensure_dealer_profile(dealer)

        with transaction.atomic():
            profile.condition_choices = serializer.validated_data
            profile.save(update_fields=["condition_choices", "updated_at"])
            # Inside the transaction: a saved choice with no acceptance beside
            # it is a contract term nobody can show the dealer agreed to.
            record_special_conditions_acceptance(
                dealer=dealer,
                user=request.user,
                choices=serializer.validated_data,
                accepted_ip=client_ip(request),
                user_agent=request.META.get("HTTP_USER_AGENT", ""),
            )

        return Response(conditions_payload(profile))
