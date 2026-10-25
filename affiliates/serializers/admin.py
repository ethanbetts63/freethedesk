from freetheplatform.security import bounds
from rest_framework import serializers

from ..models import Affiliate
from .commission import CommissionSerializer
from .self import earnings


class AdminAffiliateSerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    code = serializers.CharField(read_only=True)
    earnings = serializers.SerializerMethodField()

    class Meta:
        model = Affiliate
        fields = [
            "id", "business_name", "contact_name", "email", "website", "code",
            "earnings", "status", "status_label", "staff_notes", "status_changed_at",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "business_name", "contact_name", "email", "website", "code",
            "earnings", "status_label", "status_changed_at", "created_at", "updated_at",
        ]
        # A TextField column, which DRF maps to a CharField with no
        # maximum. Staff-written, but still a bound.
        extra_kwargs = {"staff_notes": {"max_length": bounds.FIELD_MAX["note"]}}

    def get_earnings(self, obj) -> dict:
        return earnings(obj)


class AdminAffiliateDetailSerializer(AdminAffiliateSerializer):
    """One affiliate, with every sale the list leaves out."""

    commissions = CommissionSerializer(many=True, read_only=True)
    seo_subscriber_id = serializers.SerializerMethodField()

    class Meta(AdminAffiliateSerializer.Meta):
        fields = [*AdminAffiliateSerializer.Meta.fields, "commissions", "seo_subscriber_id"]

    def get_seo_subscriber_id(self, obj):
        """The free audit, on the SEO list, so staff can reach its setup."""
        subscriber = getattr(obj.user, "seo_subscriber", None)
        return subscriber.pk if subscriber is not None else None
