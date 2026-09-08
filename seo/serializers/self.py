from rest_framework import serializers

from ..models import SeoSubscriber


class SeoSelfSerializer(serializers.ModelSerializer):
    """What an SEO customer may see and change about their own account.

    Email is read-only: it is the login identity, so changing it is a separate
    flow with its own confirmation rather than a field on a settings form.
    """

    email = serializers.EmailField(source="user.email", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    plan_label = serializers.CharField(source="get_plan_display", read_only=True)
    payment_status_label = serializers.CharField(source="get_payment_status_display", read_only=True)

    class Meta:
        model = SeoSubscriber
        fields = [
            "id", "business_name", "contact_name", "email", "phone", "website",
            "plan", "plan_label", "payment_status", "payment_status_label",
            "subscription_current_period_end", "cancel_at_period_end",
            "status", "status_label", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "email", "plan", "plan_label", "payment_status", "payment_status_label",
            "subscription_current_period_end", "cancel_at_period_end",
            "status", "status_label", "created_at", "updated_at",
        ]
