from urllib.parse import urlsplit

from rest_framework import serializers

from ..models import Enquiry


class EnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = [
            "name", "business", "email", "phone", "website", "help_with", "message",
            "configuration",
        ]

    def validate_message(self, value: str) -> str:
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError("Please provide a little more detail.")
        return value

    def validate_configuration(self, value: dict) -> dict:
        if not isinstance(value, dict):
            raise serializers.ValidationError("Configuration must be a JSON object.")
        return value


class AiReadinessEnquirySerializer(serializers.Serializer):
    """The intentionally small lead form for the free automated site check."""

    website = serializers.URLField()
    # The slim banner variant of the form asks for website and email only.
    phone = serializers.CharField(max_length=40, required=False, allow_blank=True, default="")
    email = serializers.EmailField()

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

class ProjectEnquirySerializer(serializers.Serializer):
    """The short website/automation lead form: pick a scope, name a budget."""

    HELP_WITH_BY_TYPE = {
        "website": Enquiry.HelpWith.WEBSITE,
        "automation": Enquiry.HelpWith.AUTOMATION,
        "both": Enquiry.HelpWith.EVERYTHING,
    }
    PROJECT_LABELS = {
        "website": "Website",
        "automation": "Automation",
        "both": "Website and automation",
    }

    project_type = serializers.ChoiceField(choices=sorted(HELP_WITH_BY_TYPE))
    # Free text because the "custom" option lets people write their own figure.
    budget = serializers.CharField(max_length=60)
    website = serializers.URLField()
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=40, required=False, allow_blank=True, default="")

    def create(self, validated_data):
        project_type = validated_data["project_type"]
        budget = validated_data["budget"].strip()
        hostname = urlsplit(validated_data["website"]).hostname or ""
        return Enquiry.objects.create(
            name="Website owner",
            business=hostname.removeprefix("www."),
            email=validated_data["email"],
            phone=validated_data["phone"],
            website=validated_data["website"],
            help_with=self.HELP_WITH_BY_TYPE[project_type],
            message=f"{self.PROJECT_LABELS[project_type]} enquiry. Budget: {budget}.",
            configuration={"project_type": project_type, "budget": budget},
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
