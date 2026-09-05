from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers

from .models import Dealer, DealerProfile
from .uploads import validate_and_rename_upload


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


class DealerSelfSerializer(serializers.ModelSerializer):
    """What a dealer may see and change about their own account.

    Email is read-only: it is the login identity, so changing it is a separate
    flow with its own confirmation rather than a field on a settings form.
    """

    status_label = serializers.CharField(source="get_status_display", read_only=True)
    plan_label = serializers.CharField(source="get_plan_display", read_only=True)
    payment_status_label = serializers.CharField(source="get_payment_status_display", read_only=True)
    state_label = serializers.CharField(source="get_state_display", read_only=True)

    class Meta:
        model = Dealer
        fields = [
            "id", "business_name", "contact_name", "email", "phone", "state", "state_label", "plan", "plan_label",
            "payment_status", "payment_status_label", "subscription_current_period_end",
            "cancel_at_period_end",
            "status", "status_label", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "email", "state_label", "plan", "plan_label", "payment_status", "payment_status_label",
            "subscription_current_period_end", "cancel_at_period_end",
            "status", "status_label", "created_at", "updated_at",
        ]


class AdminDealerSerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    plan_label = serializers.CharField(source="get_plan_display", read_only=True)
    payment_status_label = serializers.CharField(source="get_payment_status_display", read_only=True)
    state_label = serializers.CharField(source="get_state_display", read_only=True)

    class Meta:
        model = Dealer
        fields = [
            "id", "business_name", "contact_name", "email", "phone", "state", "state_label", "plan", "plan_label",
            "payment_status", "payment_status_label", "subscription_current_period_end",
            "cancel_at_period_end",
            "status", "status_label", "staff_notes", "status_changed_at",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "business_name", "contact_name", "email", "phone", "state", "state_label", "plan", "plan_label",
            "payment_status", "payment_status_label", "subscription_current_period_end",
            "cancel_at_period_end",
            "status_label", "status_changed_at", "created_at", "updated_at",
        ]


class DealerOnboardingSerializer(serializers.ModelSerializer):
    verification_status_label = serializers.CharField(
        source="get_verification_status_display", read_only=True
    )
    trading_name = serializers.CharField(source="dealer.business_name", read_only=True)
    state = serializers.CharField(source="dealer.state", read_only=True)
    phone = serializers.CharField(source="dealer.phone", read_only=True)
    email = serializers.EmailField(source="dealer.email", read_only=True)
    dealer_licence_document = serializers.FileField(write_only=True, required=False)
    authorised_officer_identity_document = serializers.FileField(write_only=True, required=False)
    business_evidence_document = serializers.FileField(write_only=True, required=False)
    dealer_licence_document_uploaded = serializers.SerializerMethodField()
    authorised_officer_identity_document_uploaded = serializers.SerializerMethodField()
    business_evidence_document_uploaded = serializers.SerializerMethodField()

    class Meta:
        model = DealerProfile
        fields = [
            "verification_status", "verification_status_label", "legal_name", "trading_name",
            "dealer_licence_number", "repairer_licence_number", "organisation_code", "abn", "acn",
            "address_line1", "suburb", "state", "postcode", "phone", "email",
            "authorised_officer_name", "authorised_officer_licence_number",
            "authorised_officer_date_of_birth", "declared_at", "dealer_licence_document",
            "authorised_officer_identity_document", "business_evidence_document",
            "dealer_licence_document_uploaded", "authorised_officer_identity_document_uploaded",
            "business_evidence_document_uploaded", "submitted_at",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "verification_status", "verification_status_label", "submitted_at", "created_at", "updated_at",
        ]

    def validate(self, attrs):
        for field_name in (
            "dealer_licence_document", "authorised_officer_identity_document", "business_evidence_document",
        ):
            document = attrs.get(field_name)
            if not document:
                continue
            document, error = validate_and_rename_upload(document)
            if error:
                raise serializers.ValidationError({field_name: error})
            attrs[field_name] = document
        return attrs

    def get_dealer_licence_document_uploaded(self, instance):
        return bool(instance.dealer_licence_document)

    def get_authorised_officer_identity_document_uploaded(self, instance):
        return bool(instance.authorised_officer_identity_document)

    def get_business_evidence_document_uploaded(self, instance):
        return bool(instance.business_evidence_document)

    def update(self, instance, validated_data):
        if instance.verification_status in {
            DealerProfile.VerificationStatus.SUBMITTED,
            DealerProfile.VerificationStatus.VERIFIED,
        }:
            raise serializers.ValidationError(
                "This profile is locked while it is being reviewed."
            )
        if instance.verification_status == DealerProfile.VerificationStatus.NOT_STARTED:
            validated_data["verification_status"] = DealerProfile.VerificationStatus.IN_PROGRESS
        return super().update(instance, validated_data)
