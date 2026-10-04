from rest_framework import serializers

from ..models import SiteSettings


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            "licensing_price", "contracts_price", "complete_price",
            "seo_monthly_price", "seo_quarterly_price", "seo_yearly_price", "seo_oneoff_price", "updated_at",
        ]
        read_only_fields = ["updated_at"]
