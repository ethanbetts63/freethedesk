from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import SiteSettings
from ..serializers import SiteSettingsSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def site_settings(request):
    return Response(SiteSettingsSerializer(SiteSettings.load()).data)


class AdminSiteSettingsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(SiteSettingsSerializer(SiteSettings.load()).data)

    def patch(self, request):
        serializer = SiteSettingsSerializer(SiteSettings.load(), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
