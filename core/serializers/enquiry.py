from decimal import Decimal
from urllib.parse import urlsplit

from freetheplatform.security import bounds
from rest_framework import serializers

from ..models import Enquiry, SiteSettings


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
    # Free text on one line: the "custom" option lets people write their own
    # figure in words rather than pick one.
    budget = bounds.char("line")
    # Optional: the people most likely to want a first website have none to give.
    website = bounds.url(required=False, allow_blank=True, default="")
    email = bounds.email()
    phone = serializers.CharField(max_length=40, required=False, allow_blank=True, default="")
    notes = serializers.CharField(max_length=2000, required=False, allow_blank=True, default="")

    def create(self, validated_data):
        project_type = validated_data["project_type"]
        budget = validated_data["budget"].strip()
        notes = validated_data["notes"].strip()
        hostname = urlsplit(validated_data["website"]).hostname or ""
        message = f"{self.PROJECT_LABELS[project_type]} enquiry. Budget: {budget}."
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
            configuration={"project_type": project_type, "budget": budget},
        )


def _dollars(amount: Decimal) -> str:
    """$3,000 or $3,000.50: whole dollars when there are no cents."""
    return f"${amount:,.0f}" if amount == amount.to_integral_value() else f"${amount:,.2f}"


class PackageOrderSerializer(serializers.Serializer):
    """A package bought from the website development page.

    Until checkout is built, buying records an enquiry and staff send the
    invoice. The price is read from the admin's settings at the moment of
    purchase, never taken from the browser, and kept on the enquiry so a later
    price change cannot rewrite what this customer was quoted.
    """

    PACKAGES = ("website_small", "website_large", "web_application")

    package = serializers.ChoiceField(choices=PACKAGES)
    # Optional: the people most likely to want a first website have none to give.
    website = bounds.url(required=False, allow_blank=True, default="")
    email = bounds.email()
    phone = serializers.CharField(max_length=40, required=False, allow_blank=True, default="")
    notes = serializers.CharField(max_length=2000, required=False, allow_blank=True, default="")

    @staticmethod
    def quote(code: str, settings: SiteSettings) -> tuple[str, Decimal, str, str]:
        """(name, price due now, what the price covers, enquiry type) for a package."""
        if code == "web_application":
            hours = settings.discovery_hours
            return (
                "Web application",
                settings.hourly_rate * hours,
                f"discovery, {hours} hours at {_dollars(settings.hourly_rate)} an hour",
                Enquiry.HelpWith.WEB_APPLICATION,
            )
        if code == "website_small":
            pages, page_price = settings.website_small_pages, settings.website_small_page_price
        else:
            pages, page_price = settings.website_large_pages, settings.website_large_page_price
        return (
            f"{pages}-page website",
            page_price * pages,
            f"{pages} pages at {_dollars(page_price)} a page",
            Enquiry.HelpWith.WEBSITE,
        )

    def create(self, validated_data):
        code = validated_data["package"]
        name, price, covers, help_with = self.quote(code, SiteSettings.load())
        notes = validated_data["notes"].strip()
        message = f"Bought the {name} package: {_dollars(price)}, {covers}."
        if notes:
            message = f"{message}\n\nNotes:\n{notes}"
        hostname = urlsplit(validated_data["website"]).hostname or ""
        return Enquiry.objects.create(
            name="Website owner",
            business=hostname.removeprefix("www."),
            email=validated_data["email"],
            phone=validated_data["phone"],
            website=validated_data["website"],
            help_with=help_with,
            message=message,
            configuration={"package": code, "package_name": name, "price": str(price)},
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
