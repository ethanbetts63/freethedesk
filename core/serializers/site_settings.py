from rest_framework import serializers

from ..models import SiteSettings


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            "licensing_price", "contracts_price", "complete_price",
            "seo_monthly_price", "seo_quarterly_price", "seo_yearly_price", "seo_oneoff_price",
            "hourly_rate", "discovery_hours",
            "website_launch_pages", "website_launch_page_price",
            "website_grow_pages", "website_grow_page_price",
            "website_connect_pages", "website_connect_page_price",
            "web_app_from_price", "automation_from_price",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]
