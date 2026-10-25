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

class ProjectEnquirySerializer(serializers.Serializer):
    """The short project lead form: pick a scope, name a budget. An SEO audit is sold at a fixed price, so it
    comes without one."""

    HELP_WITH_BY_TYPE = {
        "website": Enquiry.HelpWith.WEBSITE,
        "automation": Enquiry.HelpWith.AUTOMATION,
        "both": Enquiry.HelpWith.EVERYTHING,
        "seo": Enquiry.HelpWith.SEO,
    }
    PROJECT_LABELS = {
        "website": "Website",
        "automation": "Automation",
        "both": "Website and automation",
        "seo": "SEO audit",
    }

    project_type = serializers.ChoiceField(choices=sorted(HELP_WITH_BY_TYPE))
    # Free text on one line: the "custom" option lets people write their own
    # figure in words rather than pick one.
    budget = bounds.char("line", required=False, allow_blank=True, default="")
    # Optional: the people most likely to want a first website have none to give.
    website = bounds.url(required=False, allow_blank=True, default="")
    email = bounds.email()
    phone = bounds.char("phone", required=False, allow_blank=True, default="")
    notes = bounds.text("note", required=False, allow_blank=True, default="")

    def validate(self, attrs):
        if attrs["project_type"] != "seo" and not attrs["budget"].strip():
            raise serializers.ValidationError({"budget": "Budget is required."})
        return attrs

    def create(self, validated_data):
        project_type = validated_data["project_type"]
        budget = validated_data["budget"].strip()
        notes = validated_data["notes"].strip()
        hostname = urlsplit(validated_data["website"]).hostname or ""
        message = f"{self.PROJECT_LABELS[project_type]} enquiry."
        configuration = {"project_type": project_type}
        if budget:
            message = f"{message} Budget: {budget}."
            configuration["budget"] = budget
        if notes:
            message = f"{message}\n\nNotes:\n{notes}"
        return Enquiry.objects.create(
            name="Website owner",
            business=hostname.removeprefix("www."),
            email=validated_data["email"],
            phone=validated_data["phone"],
            website=validated_data["website"],
            help_with=self.HELP_WITH_BY_TYPE[project_type],
            message=message,
            configuration=configuration,
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
