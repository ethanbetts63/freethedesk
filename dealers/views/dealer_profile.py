from rest_framework.generics import RetrieveUpdateAPIView

from ..serializers import DealerSelfSerializer
from ..utils.permissions import IsDealer


class DealerProfileView(RetrieveUpdateAPIView):
    """The signed-in dealer's own account."""

    throttle_scope = "portal"  # A dealer or subscriber acting on their own record.

    permission_classes = [IsDealer]
    serializer_class = DealerSelfSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        return self.request.user.dealer
