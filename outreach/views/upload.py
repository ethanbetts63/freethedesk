from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..permissions import IsInternalApiRequest
from ..serializers import ProspectEntrySerializer, UploadSerializer
from ..utils.prospects import create_prospect


class UploadProspectsView(APIView):
    """`POST /api/outreach/upload/`: the local queue arriving, a batch at a time.

    Each entry gets its own outcome (`created`, `already_known`, `suppressed`,
    `invalid`) so the local command can archive what the server took and keep
    what it refused. Nothing here updates an existing prospect: once a row
    exists the server owns it.
    """

    throttle_scope = "internal"  # A load limit; access is the shared secret.
    authentication_classes = []
    permission_classes = [IsInternalApiRequest]

    def post(self, request):
        batch = UploadSerializer(data=request.data)
        batch.is_valid(raise_exception=True)

        results = []
        counts = {"created": 0, "already_known": 0, "suppressed": 0, "invalid": 0}
        for raw in batch.validated_data["entries"]:
            entry = ProspectEntrySerializer(data=raw)
            if not entry.is_valid():
                outcome, detail = "invalid", {"email": str(raw.get("email", "")), "errors": entry.errors}
            else:
                outcome, _ = create_prospect(entry.validated_data)
                detail = {"email": entry.validated_data["email"].lower()}
            counts[outcome] += 1
            results.append({**detail, "outcome": outcome})
        return Response({**counts, "results": results}, status=status.HTTP_200_OK)
