from rest_framework import serializers

from ..models import SiteSettings


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            "licensing_price", "contracts_price", "complete_price",
            "seo_essentials_price", "seo_plus_price", "seo_complete_price",
            "hourly_rate", "discovery_hours",
            "website_one_page_price",
            "website_small_pages", "website_small_page_price",
            "website_large_pages", "website_large_page_price",
            "automation_from_price",
            "affiliate_discount_percent", "affiliate_share_percent",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]
