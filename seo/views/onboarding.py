from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import RetrieveUpdateAPIView

from ..serializers import SeoOnboardingSerializer
from ..utils.permissions import IsSeoSubscriber
from ..utils.services import ensure_seo_profile


class SeoOnboardingView(RetrieveUpdateAPIView):
    """The optional brief, available only after payment activates."""

    throttle_scope = "portal"  # A dealer or subscriber acting on their own record.

    permission_classes = [IsSeoSubscriber]
    serializer_class = SeoOnboardingSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        subscriber = self.request.user.seo_subscriber
        if not subscriber.has_paid:
            raise PermissionDenied("Complete payment before connecting your data.")
        return ensure_seo_profile(subscriber)
