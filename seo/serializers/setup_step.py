from rest_framework import serializers

from ..models import SeoSetupStep
from ..utils.setup import REQUIRED_STEPS


class SeoSetupStepSerializer(serializers.ModelSerializer):
    """One setup step as the setup page and the staff page both show it."""

    label = serializers.CharField(source="get_key_display", read_only=True)
    state_label = serializers.CharField(source="get_state_display", read_only=True)
    required = serializers.SerializerMethodField()

    def get_required(self, obj) -> bool:
        return obj.key in REQUIRED_STEPS

    class Meta:
        model = SeoSetupStep
        fields = [
            "key", "label", "state", "state_label", "required",
            "detail", "marked_done_at", "confirmed_at",
        ]
        read_only_fields = fields
