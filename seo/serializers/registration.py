from urllib.parse import urlsplit

from freetheplatform.security import bounds
from rest_framework import serializers

from core.serializers import BaseAccountRegistrationSerializer

from ..models import SeoSubscriber


class SeoRegistrationSerializer(BaseAccountRegistrationSerializer):
    """Low-friction purchase signup; full account details follow payment."""

    tenant_model = SeoSubscriber
    tenant_defaults = {"payment_status": SeoSubscriber.PaymentStatus.PAYMENT_PENDING}

    business_name = bounds.char("business_name", required=False, allow_blank=True)
    contact_name = bounds.char("name", required=False, allow_blank=True)
    password = bounds.password(required=False, allow_blank=True, allow_null=True)
    website = bounds.url(required=False, allow_blank=True)
    report_type = serializers.ChoiceField(
        choices=SeoSubscriber.ReportType.choices, default=SeoSubscriber.ReportType.BOTH
    )
    plan = serializers.ChoiceField(choices=SeoSubscriber.Plan.choices, default=SeoSubscriber.Plan.QUARTERLY)

    def validate(self, attrs):
        attrs = super().validate(attrs)
        report_type = attrs.get("report_type", SeoSubscriber.ReportType.BOTH)
        plan = attrs.get("plan", SeoSubscriber.Plan.QUARTERLY)
        if report_type == SeoSubscriber.ReportType.GBP and plan != SeoSubscriber.Plan.ONEOFF:
            raise serializers.ValidationError({"plan": "The Google Business Profile audit is a one-time product."})
        recurring_report_types = {SeoSubscriber.ReportType.SEO, SeoSubscriber.ReportType.BOTH}
        if report_type in recurring_report_types and plan == SeoSubscriber.Plan.ONEOFF:
            raise serializers.ValidationError({"plan": "Website SEO reporting is a recurring service."})
        return attrs

    def create(self, validated_data):
        email = validated_data["email"]
        hostname = urlsplit(validated_data.get("website", "")).hostname or email.partition("@")[2]
        validated_data.setdefault("business_name", hostname.removeprefix("www."))
        validated_data.setdefault("contact_name", "Account owner")
        validated_data.setdefault("password", None)
        return super().create(validated_data)
