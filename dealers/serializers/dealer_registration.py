from rest_framework import serializers

from core.serializers import BaseAccountRegistrationSerializer

from ..models import Dealer


class DealerRegistrationSerializer(BaseAccountRegistrationSerializer):
    """Public signup: basic account plus the dealer's state, before payment."""

    tenant_model = Dealer
    tenant_defaults = {"payment_status": Dealer.PaymentStatus.PAYMENT_PENDING}

    state = serializers.ChoiceField(choices=Dealer.State.choices)
    plan = serializers.ChoiceField(choices=Dealer.Plan.choices, default=Dealer.Plan.COMPLETE)
