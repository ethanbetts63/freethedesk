from rest_framework import serializers

from .models import Enquiry, Notification


class EnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = ["name", "business", "email", "phone", "website", "help_with", "message"]

    def validate_message(self, value: str) -> str:
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError("Please provide a little more detail.")
        return value


class AdminEnquirySerializer(serializers.ModelSerializer):
    help_with_label = serializers.CharField(source="get_help_with_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Enquiry
        fields = [
            "id", "name", "business", "email", "phone", "website", "help_with",
            "help_with_label", "message", "status", "status_label", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "name", "business", "email", "phone", "website", "help_with",
            "help_with_label", "message", "status_label", "created_at", "updated_at",
        ]


class AdminNotificationSerializer(serializers.ModelSerializer):
    related_enquiry_business = serializers.CharField(
        source="related_enquiry.business", read_only=True, default=None
    )

    class Meta:
        model = Notification
        fields = [
            "id", "recipient_type", "recipient", "channel", "subject", "body", "status",
            "sent_at", "error_message", "related_enquiry", "related_enquiry_business", "created_at",
        ]
