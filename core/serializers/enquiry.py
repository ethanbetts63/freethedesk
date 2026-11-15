from urllib.parse import urlsplit

from freetheplatform.security import bounds
from rest_framework import serializers

from ..models import Enquiry


class AiReadinessEnquirySerializer(serializers.Serializer):
    """The intentionally small lead form for the free automated site check."""

    website = bounds.url()
    # The slim banner variant of the form asks for website and email only.
    phone = bounds.char("phone", required=False, allow_blank=True, default="")
    email = bounds.email()

    def create(self, validated_data):
        hostname = urlsplit(validated_data["website"]).hostname or ""
        business = hostname.removeprefix("www.")
        return Enquiry.objects.create(
            name="Website owner",
            business=business,
            help_with=Enquiry.HelpWith.AI_READINESS,
            message="Free AI readiness check requested.",
            **validated_data,
        )

class AdminEnquirySerializer(serializers.ModelSerializer):
    help_with_label = serializers.CharField(source="get_help_with_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Enquiry
        fields = [
            "id", "name", "business", "email", "phone", "website", "help_with",
            "help_with_label", "message", "configuration", "status", "status_label", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "name", "business", "email", "phone", "website", "help_with",
            "help_with_label", "message", "configuration", "status_label", "created_at", "updated_at",
        ]
