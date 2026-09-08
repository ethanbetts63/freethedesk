from rest_framework import status
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from ..serializers import SeoPasswordSerializer, SeoSelfSerializer
from ..utils.permissions import IsSeoSubscriber


class SeoAccountView(RetrieveUpdateAPIView):
    """The signed-in SEO customer's own account."""

    permission_classes = [IsSeoSubscriber]
    serializer_class = SeoSelfSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        return self.request.user.seo_subscriber


class SeoPasswordView(APIView):
    permission_classes = [IsSeoSubscriber]

    def post(self, request):
        serializer = SeoPasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"status": "password_set"}, status=status.HTTP_200_OK)
