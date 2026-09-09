from rest_framework import serializers

from core.serializers import BaseAccountRegistrationSerializer

from ..models import Dealer


class DealerRegistrationSerializer(BaseAccountRegistrationSerializer):
    """Public signup: basic account plus the dealer's state, before payment."""

    tenant_model = Dealer
    tenant_defaults = {"payment_status": Dealer.PaymentStatus.PAYMENT_PENDING}

    business_name = serializers.CharField(max_length=180, required=False, allow_blank=True)
    contact_name = serializers.CharField(max_length=120, required=False, allow_blank=True)
    state = serializers.ChoiceField(choices=Dealer.State.choices)
    plan = serializers.ChoiceField(choices=Dealer.Plan.choices, default=Dealer.Plan.COMPLETE)

    def create(self, validated_data):
        email = validated_data["email"]
        email_domain = email.partition("@")[2] or "New dealer account"
        validated_data.setdefault("business_name", email_domain.removeprefix("www."))
        validated_data.setdefault("contact_name", "Account owner")
        return super().create(validated_data)
