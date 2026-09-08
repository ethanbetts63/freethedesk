from urllib.parse import urlsplit

from rest_framework import serializers

from core.serializers import BaseAccountRegistrationSerializer

from ..models import SeoSubscriber


class SeoRegistrationSerializer(BaseAccountRegistrationSerializer):
    """Low-friction purchase signup; full account details follow payment."""

    tenant_model = SeoSubscriber
    tenant_defaults = {"payment_status": SeoSubscriber.PaymentStatus.PAYMENT_PENDING}

    business_name = serializers.CharField(max_length=180, required=False, allow_blank=True)
    contact_name = serializers.CharField(max_length=120, required=False, allow_blank=True)
    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        allow_null=True,
        style={"input_type": "password"},
    )
    website = serializers.URLField(required=False, allow_blank=True)
    report_type = serializers.ChoiceField(
        choices=SeoSubscriber.ReportType.choices, default=SeoSubscriber.ReportType.BOTH
    )
    plan = serializers.ChoiceField(choices=SeoSubscriber.Plan.choices, default=SeoSubscriber.Plan.QUARTERLY)

    def create(self, validated_data):
        email = validated_data["email"]
        hostname = urlsplit(validated_data.get("website", "")).hostname or email.partition("@")[2]
        validated_data.setdefault("business_name", hostname.removeprefix("www."))
        validated_data.setdefault("contact_name", "Account owner")
        validated_data.setdefault("password", None)
        return super().create(validated_data)
