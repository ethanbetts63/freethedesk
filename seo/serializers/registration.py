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
    # A subscription always starts monthly; the slower cadences are reached
    # later by moving the subscriber, so they are not offered here.
    plan = serializers.ChoiceField(
        choices=[(plan.value, plan.label) for plan in SeoSubscriber.SIGNUP_PLANS],
        default=SeoSubscriber.Plan.MONTHLY,
    )

    def create(self, validated_data):
        email = validated_data["email"]
        hostname = urlsplit(validated_data.get("website", "")).hostname or email.partition("@")[2]
        validated_data.setdefault("business_name", hostname.removeprefix("www."))
        validated_data.setdefault("contact_name", "Account owner")
        validated_data.setdefault("password", None)
        return super().create(validated_data)
