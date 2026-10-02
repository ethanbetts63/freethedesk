from rest_framework.generics import RetrieveUpdateAPIView

from ..serializers import SeoSelfSerializer
from ..utils.permissions import IsSeoSubscriber


class SeoAccountView(RetrieveUpdateAPIView):
    """The signed-in SEO customer's own account."""

    throttle_scope = "portal"  # A dealer or subscriber acting on their own record.

    permission_classes = [IsSeoSubscriber]
    serializer_class = SeoSelfSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        return self.request.user.seo_subscriber
