from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def health_check(request):
    """Small endpoint used by local checks and future deployment monitoring."""
    return Response({"status": "ok", "service": "freethedesk-api"})

