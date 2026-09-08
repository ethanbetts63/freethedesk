from rest_framework import serializers

from ..models import DealerProfile
from ..utils.uploads import validate_and_rename_upload


class DealerOnboardingSerializer(serializers.ModelSerializer):
    onboarding_status_label = serializers.CharField(
        source="get_onboarding_status_display", read_only=True
    )
    trading_name = serializers.CharField(source="dealer.business_name", read_only=True)
    state = serializers.CharField(source="dealer.state", read_only=True)
    phone = serializers.CharField(source="dealer.phone", read_only=True)
    email = serializers.EmailField(source="dealer.user.email", read_only=True)
    dealer_licence_document = serializers.FileField(write_only=True, required=False)
    authorised_officer_identity_document = serializers.FileField(write_only=True, required=False)
    business_evidence_document = serializers.FileField(write_only=True, required=False)
    dealer_licence_document_uploaded = serializers.SerializerMethodField()
    authorised_officer_identity_document_uploaded = serializers.SerializerMethodField()
    business_evidence_document_uploaded = serializers.SerializerMethodField()

    class Meta:
        model = DealerProfile
        fields = [
            "onboarding_status", "onboarding_status_label", "legal_name", "trading_name",
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
            "onboarding_status", "onboarding_status_label", "submitted_at", "created_at", "updated_at",
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
        if instance.onboarding_status == DealerProfile.OnboardingStatus.SUBMITTED:
            raise serializers.ValidationError(
                "This profile is locked while it is being reviewed."
            )
        if instance.onboarding_status == DealerProfile.OnboardingStatus.NOT_STARTED:
            validated_data["onboarding_status"] = DealerProfile.OnboardingStatus.IN_PROGRESS
        return super().update(instance, validated_data)
