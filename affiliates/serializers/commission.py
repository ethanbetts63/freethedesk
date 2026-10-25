from rest_framework import serializers

from ..models import Commission


class CommissionSerializer(serializers.ModelSerializer):
    """One sale, as the affiliate and staff both see it. Read-only everywhere."""

    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Commission
        fields = [
            "id", "description", "sale_amount", "amount", "currency",
            "status", "status_label", "note", "paid_at", "voided_at", "created_at",
        ]
        read_only_fields = fields
