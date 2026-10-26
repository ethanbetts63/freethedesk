from freetheplatform.security import bounds
from rest_framework import serializers

from ..models import PodcastProspect


class AdminProspectSerializer(serializers.ModelSerializer):
    """A prospect as the dashboard shows it. Only `reply` and `excluded_reason` are written."""

    status = serializers.CharField(read_only=True)
    version_label = serializers.CharField(source="get_version_display", read_only=True)
    reply_label = serializers.CharField(source="get_reply_display", read_only=True)
    relevance_label = serializers.CharField(source="get_relevance_display", read_only=True)
    affiliate_name = serializers.SerializerMethodField()

    class Meta:
        model = PodcastProspect
        fields = [
            "id", "email", "email_source", "podcast_name", "host_name", "first_name", "website",
            "apple_url", "genre", "episode_count", "latest_episode_title",
            "latest_episode_description", "last_release_date", "opener", "relevance",
            "relevance_label", "version", "version_label", "pitched_at", "reply", "reply_label", "affiliate", "affiliate_name", "excluded_reason",
            "status", "scraped_on", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "email", "email_source", "podcast_name", "host_name", "first_name", "website",
            "apple_url", "genre", "episode_count", "latest_episode_title",
            "latest_episode_description", "last_release_date", "opener", "relevance",
            "relevance_label", "version", "version_label", "pitched_at", "reply_label", "affiliate", "affiliate_name", "status", "scraped_on",
            "created_at", "updated_at",
        ]
        # A TextField column, which DRF maps to a CharField with no maximum.
        extra_kwargs = {"excluded_reason": {"max_length": bounds.FIELD_MAX["note"]}}

    def get_affiliate_name(self, obj) -> str:
        return obj.affiliate.business_name if obj.affiliate_id else ""
