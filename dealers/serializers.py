from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers

from .models import Dealer


class DealerRegistrationSerializer(serializers.Serializer):
    """Public signup. Deliberately five fields — see _docs/licensing/plan/01-staff-app.md."""

    business_name = serializers.CharField(max_length=180)
    contact_name = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=40, required=False, allow_blank=True)
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
        return Dealer.objects.create(user=user, **validated_data)


class DealerSelfSerializer(serializers.ModelSerializer):
    """What a dealer may see and change about their own account.

    Email is read-only: it is the login identity, so changing it is a separate
    flow with its own confirmation rather than a field on a settings form.
    """

    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Dealer
        fields = [
            "id", "business_name", "contact_name", "email", "phone",
            "status", "status_label", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "email", "status", "status_label", "created_at", "updated_at"]


class AdminDealerSerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Dealer
        fields = [
            "id", "business_name", "contact_name", "email", "phone",
            "status", "status_label", "staff_notes", "status_changed_at",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "business_name", "contact_name", "email", "phone",
            "status_label", "status_changed_at", "created_at", "updated_at",
        ]
