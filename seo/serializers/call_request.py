import re

from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from freetheplatform.security import bounds
from rest_framework import serializers

from ..models import SeoCallRequest


class SeoCallRequestSerializer(serializers.ModelSerializer):
    """The public call-back form: an email or a phone number, and optionally the website and a note."""

    contact = bounds.char("email")
    website = bounds.url(required=False, allow_blank=True, default="")
    notes = bounds.text("note", required=False, allow_blank=True, default="")
    source = bounds.char("reference", required=False, allow_blank=True, default="")

    class Meta:
        model = SeoCallRequest
        fields = ["contact", "website", "notes", "source"]

    def validate_contact(self, value):
        """An email address, or a phone number of at least eight digits."""
        value = value.strip()
        if "@" in value:
            try:
                validate_email(value)
            except DjangoValidationError:
                raise serializers.ValidationError("Enter a valid email address or phone number.")
            return value
        if len(re.sub(r"\D", "", value)) < 8 or not re.fullmatch(r"[\d\s()+.-]+", value):
            raise serializers.ValidationError("Enter a valid email address or phone number.")
        return value


class AdminSeoCallRequestSerializer(serializers.ModelSerializer):
    """A request in the dashboard's table. Staff change only the status and their call notes."""

    site = serializers.CharField(read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    call_notes = bounds.text("note", required=False, allow_blank=True)

    class Meta:
        model = SeoCallRequest
        fields = [
            "id", "contact", "website", "site", "notes", "source", "status", "status_label",
            "prospect", "call_notes", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "contact", "website", "site", "notes", "source", "prospect", "created_at", "updated_at",
        ]
