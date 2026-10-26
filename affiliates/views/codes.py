from django.db import transaction
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from ..serializers import AffiliateSelfSerializer
from ..utils.codes import CodeError, create_named_code, remove_code
from ..utils.permissions import IsAffiliate


class AffiliateCodeListView(APIView):
    """An affiliate adding a code of their own: ``{"code": "SPARKY"}``.

    Returns the whole account, codes included, so the page that posted has
    nothing further to fetch.
    """

    throttle_scope = "portal"
    permission_classes = [IsAffiliate]

    def post(self, request):
        affiliate = request.user.affiliate
        try:
            with transaction.atomic():
                create_named_code(affiliate, request.data.get("code", ""))
        except CodeError as error:
            raise ValidationError({"code": [str(error)]}) from error
        return Response(AffiliateSelfSerializer(affiliate).data, status=status.HTTP_201_CREATED)


class AffiliateCodeDetailView(APIView):
    """An affiliate switching one of their own added codes off."""

    throttle_scope = "portal"
    permission_classes = [IsAffiliate]

    def delete(self, request, pk):
        affiliate = request.user.affiliate
        try:
            with transaction.atomic():
                remove_code(affiliate, pk)
        except CodeError as error:
            raise ValidationError({"code": [str(error)]}) from error
        return Response(AffiliateSelfSerializer(affiliate).data)
