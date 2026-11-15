from freetheplatform.security import bounds
from rest_framework import serializers

from ..models import SeoCallRequest


class SeoCallRequestSerializer(serializers.ModelSerializer):
    """The public call-back form: a phone number, and optionally the website and a note."""

    phone = bounds.char("phone")
    website = bounds.url(required=False, allow_blank=True, default="")
    notes = bounds.text("note", required=False, allow_blank=True, default="")
    source = bounds.char("reference", required=False, allow_blank=True, default="")

    class Meta:
        model = SeoCallRequest
        fields = ["phone", "website", "notes", "source"]


class AdminSeoCallRequestSerializer(serializers.ModelSerializer):
    """A request in the dashboard's table. Staff change only the status and their call notes."""

    site = serializers.CharField(read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    call_notes = bounds.text("note", required=False, allow_blank=True)

    class Meta:
        model = SeoCallRequest
        fields = [
            "id", "phone", "website", "site", "notes", "source", "status", "status_label",
            "prospect", "call_notes", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "phone", "website", "site", "notes", "source", "prospect", "created_at", "updated_at",
        ]
