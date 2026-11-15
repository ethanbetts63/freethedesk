from datetime import date, datetime

from django.db import IntegrityError, transaction
from freetheplatform.security import bounds
from rest_framework import serializers

from ..models import SeoCallBooking, SeoCallSettings
from ..models.call_settings import WEEKDAYS
from ..utils.call_slots import CALL_LENGTH, is_available, perth_label

TAKEN = "That time has just been booked. Pick another."


class SeoCallBookingSerializer(serializers.Serializer):
    """The public booking form for the free 30-minute SEO review: name, website, phone, email and optional notes.

    The call is by phone, so the number is required; the email carries the confirmation.
    """

    starts_at = serializers.DateTimeField()
    name = bounds.char("name")
    website = bounds.url()
    phone = bounds.char("phone")
    email = bounds.email()
    notes = bounds.text("note", required=False, allow_blank=True, default="")
    source = bounds.char("reference", required=False, allow_blank=True, default="")

    def validate_starts_at(self, value):
        if not is_available(value):
            raise serializers.ValidationError("That time can't be booked. Pick one from the list.")
        return value

    def create(self, validated_data):
        try:
            with transaction.atomic():
                return SeoCallBooking.objects.create(**validated_data)
        except IntegrityError:
            # Two people submitted the same slot at once; the constraint let one through.
            raise serializers.ValidationError({"starts_at": [TAKEN]})


class AdminSeoCallBookingSerializer(serializers.ModelSerializer):
    """A booking in the dashboard's diary and table. Staff change only the status and their call notes."""

    site = serializers.CharField(read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    when = serializers.SerializerMethodField()
    call_notes = bounds.text("note", required=False, allow_blank=True)

    class Meta:
        model = SeoCallBooking
        fields = [
            "id", "starts_at", "when", "name", "website", "site", "phone", "email", "notes", "source",
            "status", "status_label", "prospect", "call_notes", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "starts_at", "when", "name", "website", "site", "phone", "email", "notes", "source",
            "prospect", "created_at", "updated_at",
        ]

    def get_when(self, booking) -> str:
        return perth_label(booking.starts_at)


class SeoCallSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeoCallSettings
        fields = [
            "booking_advance_notice", "start_time", "end_time", "weeks_shown",
            "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
        ]

    def validate(self, attrs):
        start = attrs.get("start_time", self.instance.start_time if self.instance else None)
        end = attrs.get("end_time", self.instance.end_time if self.instance else None)
        if start and end and (datetime.combine(date.min, end) - datetime.combine(date.min, start)) < CALL_LENGTH:
            raise serializers.ValidationError({"end_time": "The end time must be at least 30 minutes after the start."})
        days = {name: attrs.get(name, getattr(self.instance, name, False)) for name in WEEKDAYS}
        if not any(days.values()):
            raise serializers.ValidationError({"monday": "Tick at least one day."})
        return attrs
