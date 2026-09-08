from rest_framework import serializers

from core.serializers import BaseAccountRegistrationSerializer

from ..models import SeoSubscriber


class SeoRegistrationSerializer(BaseAccountRegistrationSerializer):
    """Public signup: basic account plus the site to report on, before payment."""

    tenant_model = SeoSubscriber
    tenant_defaults = {"payment_status": SeoSubscriber.PaymentStatus.PAYMENT_PENDING}

    website = serializers.URLField(required=False, allow_blank=True)
    plan = serializers.ChoiceField(choices=SeoSubscriber.Plan.choices, default=SeoSubscriber.Plan.QUARTERLY)
