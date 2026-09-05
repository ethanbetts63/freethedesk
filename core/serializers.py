from rest_framework import serializers

from .models import Enquiry, LicensingSettings, Notification


class LicensingSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LicensingSettings
        fields = ["licensing_price", "contracts_price", "complete_price", "updated_at"]
        read_only_fields = ["updated_at"]


class EnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = [
            "name", "business", "email", "phone", "website", "help_with", "message",
            "configuration",
        ]

    def validate_message(self, value: str) -> str:
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError("Please provide a little more detail.")
        return value

    def validate_configuration(self, value: dict) -> dict:
        if not isinstance(value, dict):
            raise serializers.ValidationError("Configuration must be a JSON object.")
        return value


class AdminEnquirySerializer(serializers.ModelSerializer):
    help_with_label = serializers.CharField(source="get_help_with_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Enquiry
        fields = [
            "id", "name", "business", "email", "phone", "website", "help_with",
            "help_with_label", "message", "configuration", "status", "status_label", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "name", "business", "email", "phone", "website", "help_with",
            "help_with_label", "message", "configuration", "status_label", "created_at", "updated_at",
        ]


class AdminNotificationSerializer(serializers.ModelSerializer):
    related_enquiry_business = serializers.CharField(
        source="related_enquiry.business", read_only=True, default=None
    )
    related_dealer_business = serializers.CharField(
        source="related_dealer.business_name", read_only=True, default=None
    )

    class Meta:
        model = Notification
        fields = [
            "id", "recipient_type", "recipient", "channel", "subject", "body", "status",
            "sent_at", "error_message", "related_enquiry", "related_enquiry_business",
            "related_dealer", "related_dealer_business", "created_at",
        ]
