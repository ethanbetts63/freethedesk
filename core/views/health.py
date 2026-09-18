from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "ok", "service": "freethedesk-api"})


# Deliberately unlimited. This is what a load balancer or an uptime monitor
# calls, on a schedule, forever; throttling it would report the API as down at
# exactly the moment it was fine. It reads nothing and touches no database.
health_check.cls.ftp_throttle_exempt = True
