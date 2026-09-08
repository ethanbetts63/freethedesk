from rest_framework import serializers

from ..models import SeoProfile


class SeoOnboardingSerializer(serializers.ModelSerializer):
    """The reporting inputs an SEO customer fills in after payment."""

    onboarding_status_label = serializers.CharField(
        source="get_onboarding_status_display", read_only=True
    )
    business_name = serializers.CharField(source="subscriber.business_name", read_only=True)
    email = serializers.EmailField(source="subscriber.user.email", read_only=True)

    class Meta:
        model = SeoProfile
        fields = [
            "onboarding_status", "onboarding_status_label", "business_name", "email",
            "website_url", "search_console_property", "primary_location",
            "target_keywords", "competitors", "google_business_profile_url", "notes",
            "submitted_at", "created_at", "updated_at",
        ]
        read_only_fields = [
            "onboarding_status", "onboarding_status_label", "submitted_at",
            "created_at", "updated_at",
        ]

    def update(self, instance, validated_data):
        if instance.onboarding_status == SeoProfile.OnboardingStatus.NOT_STARTED:
            validated_data["onboarding_status"] = SeoProfile.OnboardingStatus.IN_PROGRESS
        return super().update(instance, validated_data)
