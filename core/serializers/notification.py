from rest_framework import serializers

from ..models import Notification


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
