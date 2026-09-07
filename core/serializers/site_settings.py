from rest_framework import serializers

from ..models import SiteSettings


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            "licensing_price", "contracts_price", "complete_price",
            "seo_monthly_price", "seo_quarterly_price", "seo_biannual_price", "seo_oneoff_price",
            "gbp_audit_price", "ai_readiness_audit_price", "updated_at",
        ]
        read_only_fields = ["updated_at"]
