from rest_framework.generics import RetrieveUpdateAPIView

from ..serializers import AffiliateSelfSerializer
from ..utils.permissions import IsAffiliate


class AffiliateAccountView(RetrieveUpdateAPIView):
    """The signed-in affiliate's own account: code, link, sales and details."""

    throttle_scope = "portal"  # A dealer or subscriber acting on their own record.

    permission_classes = [IsAffiliate]
    serializer_class = AffiliateSelfSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        return self.request.user.affiliate
