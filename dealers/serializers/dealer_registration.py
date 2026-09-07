from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers

from ..models import Dealer


class DealerRegistrationSerializer(serializers.Serializer):
    """Public signup: only basic account and state details before payment."""

    business_name = serializers.CharField(max_length=180)
    contact_name = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=40, required=False, allow_blank=True)
    state = serializers.ChoiceField(choices=Dealer.State.choices)
    plan = serializers.ChoiceField(choices=Dealer.Plan.choices, default=Dealer.Plan.DEMO)
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate_email(self, value: str) -> str:
        value = value.strip().lower()
        if get_user_model().objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account already exists for this email address.")
        return value

    def validate_password(self, value: str) -> str:
        try:
            validate_password(value)
        except DjangoValidationError as error:
            raise serializers.ValidationError(list(error.messages)) from error
        return value

    @transaction.atomic
    def create(self, validated_data) -> Dealer:
        password = validated_data.pop("password")
        email = validated_data["email"]
        user = get_user_model().objects.create_user(
            # Username is the email: dealers never see or type a separate one,
            # and it keeps the login form single-field.
            username=email[:150],
            email=email,
            password=password,
            is_staff=False,
        )
        plan = validated_data.get("plan", Dealer.Plan.DEMO)
        payment_status = (
            Dealer.PaymentStatus.DEMO
            if plan == Dealer.Plan.DEMO
            else Dealer.PaymentStatus.PAYMENT_PENDING
        )
        return Dealer.objects.create(
            user=user,
            payment_status=payment_status,
            **validated_data,
        )
