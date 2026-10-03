from freetheplatform.security import bounds
from rest_framework import serializers

from ..models import SeoProfile


class SeoOnboardingSerializer(serializers.ModelSerializer):
    """The optional brief an SEO customer fills in after payment.

    ``search_console_property`` is read-only: the Search Console setup check
    writes the property it matched, so a customer can't point us at one we
    can't read.
    """

    business_name = serializers.CharField(source="subscriber.business_name", read_only=True)
    email = serializers.EmailField(source="subscriber.email", read_only=True)

    class Meta:
        model = SeoProfile
        fields = [
            "business_name", "email",
            "website_url", "search_console_property", "primary_location",
            "target_keywords", "competitors", "google_business_profile_url", "notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["search_console_property", "created_at", "updated_at"]
        # Three TextField columns, which DRF maps to CharFields with no
        # maximum. A customer types these, so they are notes, not documents.
        extra_kwargs = {
            "target_keywords": {"max_length": bounds.FIELD_MAX["note"]},
            "competitors": {"max_length": bounds.FIELD_MAX["note"]},
            "notes": {"max_length": bounds.FIELD_MAX["note"]},
        }
