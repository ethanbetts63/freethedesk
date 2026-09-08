from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers

from ..models import SeoSubscriber


class SeoRegistrationSerializer(serializers.Serializer):
    """Public signup: only basic account details before payment."""

    business_name = serializers.CharField(max_length=180)
    contact_name = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=40, required=False, allow_blank=True)
    website = serializers.URLField(required=False, allow_blank=True)
    plan = serializers.ChoiceField(choices=SeoSubscriber.Plan.choices, default=SeoSubscriber.Plan.QUARTERLY)
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
    def create(self, validated_data) -> SeoSubscriber:
        password = validated_data.pop("password")
        email = validated_data.pop("email")
        user = get_user_model().objects.create_user(
            # Username is the email: customers never see or type a separate one.
            username=email[:150],
            email=email,
            password=password,
            is_staff=False,
        )
        return SeoSubscriber.objects.create(
            user=user,
            payment_status=SeoSubscriber.PaymentStatus.PAYMENT_PENDING,
            **validated_data,
        )
