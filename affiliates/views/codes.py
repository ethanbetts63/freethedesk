from django.db import transaction
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from ..serializers import AffiliateSelfSerializer
from ..utils.codes import CodeError, create_named_code, remove_code, set_primary_code
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
    """One of the affiliate's own codes: delete it, or make it the primary.

    Both answer with the whole account, as the list view does.
    """

    throttle_scope = "portal"
    permission_classes = [IsAffiliate]

    def patch(self, request, pk):
        """``{"primary": true}``: this code is the one the marketing material carries."""
        if request.data.get("primary") is not True:
            raise ValidationError({"primary": ["Send primary: true to make this code primary."]})
        affiliate = request.user.affiliate
        try:
            with transaction.atomic():
                set_primary_code(affiliate, pk)
        except CodeError as error:
            raise ValidationError({"code": [str(error)]}) from error
        return Response(AffiliateSelfSerializer(affiliate).data)

    def delete(self, request, pk):
        affiliate = request.user.affiliate
        try:
            with transaction.atomic():
                remove_code(affiliate, pk)
        except CodeError as error:
            raise ValidationError({"code": [str(error)]}) from error
        return Response(AffiliateSelfSerializer(affiliate).data)
