from rest_framework import serializers

from ..models import Dealer


class AdminDealerSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
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
            "id", "business_name", "contact_name", "phone", "state", "state_label", "plan", "plan_label",
            "payment_status", "payment_status_label", "subscription_current_period_end",
            "cancel_at_period_end",
            "status_label", "status_changed_at", "created_at", "updated_at",
        ]
