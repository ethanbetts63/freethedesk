from rest_framework import serializers

from ..models import SeoSubscriber


class AdminSeoSubscriberSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    plan_label = serializers.CharField(source="get_plan_display", read_only=True)
    report_type_label = serializers.CharField(source="get_report_type_display", read_only=True)
    payment_status_label = serializers.CharField(source="get_payment_status_display", read_only=True)

    class Meta:
        model = SeoSubscriber
        fields = [
            "id", "business_name", "contact_name", "email", "phone", "website",
            "plan", "plan_label", "report_type", "report_type_label", "payment_status", "payment_status_label",
            "subscription_current_period_end", "cancel_at_period_end",
            "status", "status_label", "staff_notes", "status_changed_at",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "business_name", "contact_name", "phone", "website", "plan", "plan_label",
            "report_type", "report_type_label",
            "payment_status", "payment_status_label", "subscription_current_period_end",
            "cancel_at_period_end", "status_label", "status_changed_at",
            "created_at", "updated_at",
        ]
