from rest_framework import serializers

from ..utils.setup import is_setup_complete, setup_steps
from .admin import AdminSeoSubscriberSerializer
from .setup_step import SeoSetupStepSerializer


class AdminSeoSubscriberDetailSerializer(AdminSeoSubscriberSerializer):
    """One subscriber, with the setup checklist the list leaves out."""

    setup = serializers.SerializerMethodField()

    def get_setup(self, obj):
        """The checklist, once there is one: it starts at payment."""
        if not obj.has_paid:
            return None
        return {
            "steps": SeoSetupStepSerializer(setup_steps(obj), many=True).data,
            "complete": is_setup_complete(obj),
        }

    class Meta(AdminSeoSubscriberSerializer.Meta):
        fields = [*AdminSeoSubscriberSerializer.Meta.fields, "setup"]
