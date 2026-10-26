import logging

from freetheplatform.messaging import Suppression, suppress
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..utils.unsubscribe import prospect_for_token

logger = logging.getLogger(__name__)

INVALID = {"detail": "That unsubscribe link isn't valid."}


class UnsubscribeView(APIView):
    """The unsubscribe link in every podcast pitch.

    GET only says whether the token is good; it changes nothing. POST, from the
    page's button, puts the address on messaging's suppression list, which
    delivery checks for every message. Two steps because corporate mail
    scanners open every link in an email before a person does. The address is
    never echoed back: the token is all a stranger who found the link would have.
    """

    throttle_scope = "unsubscribe"
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, token):
        if prospect_for_token(token) is None:
            return Response(INVALID, status=status.HTTP_400_BAD_REQUEST)
        return Response({"valid": True})

    def post(self, request, token):
        prospect = prospect_for_token(token)
        if prospect is None:
            return Response(INVALID, status=status.HTTP_400_BAD_REQUEST)
        suppression = suppress(prospect.email, reason=Suppression.Reason.OPTED_OUT)
        if suppression is not None:
            logger.info("Podcast outreach unsubscribe: prospect %s is on the suppression list.", prospect.pk)
        return Response({"unsubscribed": True})
