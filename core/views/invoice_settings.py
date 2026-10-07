from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import InvoiceSettings
from ..serializers import InvoiceSettingsSerializer


class AdminInvoiceSettingsView(APIView):
    """Staff only, and never folded into the public site-settings endpoint: it holds bank details."""

    throttle_scope = "staff"
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(InvoiceSettingsSerializer(InvoiceSettings.load()).data)

    def patch(self, request):
        serializer = InvoiceSettingsSerializer(InvoiceSettings.load(), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
