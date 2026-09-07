from rest_framework import serializers

from ..models import Enquiry


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
