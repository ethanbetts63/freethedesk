from django.db.models import Count, Q
from freetheplatform.messaging import Suppression, suppress
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from core.utils.ordering import apply_ordering
from core.utils.pagination import DashboardPagination

from ..models import PodcastProspect
from ..serializers import AdminProspectSerializer
from ..utils.pitching import VERSIONS
from ..utils.prospects import STATUSES, with_status

PROSPECT_ORDERING = {
    "created_at": ("created_at",),
    "pitched_at": ("pitched_at",),
    "podcast_name": ("podcast_name",),
    "version": ("version",),
    "status": ("status",),
}


def _csv(params, key):
    return [part.strip() for part in params.get(key, "").split(",") if part.strip()]


class AdminProspectListView(ListAPIView):
    throttle_scope = "staff"  # Runaway-client limit; access is gated by the permission class.
    permission_classes = [IsAdminUser]
    serializer_class = AdminProspectSerializer
    pagination_class = DashboardPagination

    def get_queryset(self):
        params = self.request.query_params
        queryset = with_status(PodcastProspect.objects.select_related("affiliate"))
        for field in ("status", "version", "reply"):
            values = _csv(params, field)
            if values:
                queryset = queryset.filter(**{f"{field}__in": values})
        search = params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(podcast_name__icontains=search)
                | Q(host_name__icontains=search)
                | Q(email__icontains=search)
            )
        return apply_ordering(queryset, params, PROSPECT_ORDERING)


class AdminProspectDetailView(RetrieveUpdateAPIView):
    throttle_scope = "staff"  # Runaway-client limit; access is gated by the permission class.
    permission_classes = [IsAdminUser]
    serializer_class = AdminProspectSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        return with_status(PodcastProspect.objects.select_related("affiliate"))

    def perform_update(self, serializer):
        serializer.save()
        # The composed status was annotated before the change; answer with the one after it.
        serializer.instance = self.get_queryset().get(pk=serializer.instance.pk)


class AdminProspectUnsubscribeView(APIView):
    """For the version C replies that say "no thanks": the address goes on the suppression list."""

    throttle_scope = "staff"
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        prospect = with_status(PodcastProspect.objects.select_related("affiliate")).filter(pk=pk).first()
        if prospect is None:
            return Response({"detail": "Not found."}, status=404)
        suppress(prospect.email, reason=Suppression.Reason.OPTED_OUT)
        if prospect.reply == PodcastProspect.Reply.NONE:
            prospect.reply = PodcastProspect.Reply.NEGATIVE
            prospect.save(update_fields=["reply", "updated_at"])
        prospect = with_status(PodcastProspect.objects.select_related("affiliate")).get(pk=pk)
        return Response(AdminProspectSerializer(prospect).data)


class AdminOutreachSummaryView(APIView):
    """Per version: how many are queued, where the sent ones got to, replies and sign-ups."""

    throttle_scope = "staff"
    permission_classes = [IsAdminUser]

    def get(self, request):
        rows = (
            with_status(PodcastProspect.objects.all())
            .values("version", "status")
            .annotate(n=Count("id"))
        )
        replies = (
            PodcastProspect.objects.filter(reply=PodcastProspect.Reply.POSITIVE)
            .values("version")
            .annotate(n=Count("id"))
        )
        summary = {
            version: {"version": version, "total": 0, "positive": 0, **{status: 0 for status in STATUSES}}
            for version in VERSIONS
        }
        for row in rows:
            entry = summary[row["version"]]
            entry[row["status"]] = entry.get(row["status"], 0) + row["n"]
            entry["total"] += row["n"]
        for row in replies:
            summary[row["version"]]["positive"] = row["n"]
        return Response({"versions": [summary[version] for version in VERSIONS]})
