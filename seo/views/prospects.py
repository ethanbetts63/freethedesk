from django.db import IntegrityError, transaction
from django.db.models import Count, Q
from django.conf import settings
from freetheplatform.messaging import Message, Suppression, is_suppressed, send, suppress
from freetheplatform.messaging.utils import read_uploads
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from affiliates.utils.permissions import IsInternalApiRequest
from core.utils.ordering import apply_ordering
from core.utils.pagination import DashboardPagination

from ..models import SeoProspect
from ..serializers.prospect import AdminSeoProspectSerializer, SeoMessageSendSerializer, SeoProspectUploadSerializer
from ..utils.prospect_sending import NoSubject, next_body, next_subject, subject_for
from ..utils.prospects import STATUSES, with_status

PROSPECT_ORDERING = {
    "created_at": ("created_at",),
    "sent_at": ("sent_at",),
    "called_at": ("called_at",),
    "business": ("business",),
    "status": ("status",),
}


def _csv(params, key):
    return [part.strip() for part in params.get(key, "").split(",") if part.strip()]


class SeoProspectUploadView(APIView):
    """`POST /api/seo/prospects/`: a published prospect report, queued for the hourly send.

    One report per business: a domain, slug or address already here is refused
    with 409 and the row is left as it is, so a pipeline run that posts twice
    never sends twice. A suppressed address is refused too.
    """

    throttle_scope = "internal"  # A load limit; access is the shared secret.
    authentication_classes = []
    permission_classes = [IsInternalApiRequest]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        upload = SeoProspectUploadSerializer(data=request.data)
        upload.is_valid(raise_exception=True)
        data = upload.validated_data
        for field in ("domain", "slug", "email"):
            if SeoProspect.objects.filter(**{field: data[field]}).exists():
                return Response(
                    {"outcome": "already_known", "field": field, "detail": f"A prospect with this {field} exists."},
                    status=status.HTTP_409_CONFLICT,
                )
        if is_suppressed(data["email"]):
            return Response(
                {"outcome": "suppressed", "detail": "The address is on the suppression list."},
                status=status.HTTP_409_CONFLICT,
            )
        pdf = data.pop("report_pdf")
        try:
            subject_version = next_subject(has_search=bool(data.get("paid_searches")))
        except NoSubject as error:
            return Response({"outcome": "no_subject", "detail": str(error)}, status=status.HTTP_400_BAD_REQUEST)
        try:
            with transaction.atomic():
                prospect = SeoProspect(
                    **data, subject_version=subject_version,
                    body_version=next_body(data.get("purpose", SeoProspect.Purpose.CLIENT)),
                )
                prospect.report_pdf.save(f"{data['slug']}_{data['report_version']}.pdf", pdf, save=False)
                prospect.save()
        except IntegrityError:
            # Two posts of the same report at once; the first one won.
            return Response({"outcome": "already_known", "detail": "A prospect with these details exists."},
                            status=status.HTTP_409_CONFLICT)
        return Response(
            {"outcome": "queued", "id": prospect.pk, "purpose": prospect.purpose,
             "subject_version": prospect.subject_version, "subject": subject_for(prospect),
             "body_version": prospect.body_version, "body_label": prospect.get_body_version_display()},
            status=status.HTTP_201_CREATED,
        )


class SeoMessageSendView(APIView):
    """`POST /api/seo/messages/`: one email written on the local machine, sent now, as given, with its files.

    The note after a call ("thanks for taking my call, here it is again") and
    any other one-off to a business the owner has spoken to. The upload above
    refuses a business it already knows, which is right for a first contact and
    wrong for a follow-up, so this one sends what it is given: the caller, on
    the owner's word, decides. Plain text, the outreach sender when one is
    configured, and related to the prospect row with the same address so the
    dashboard shows it under the call. Its message type is not one of the
    report's, so it never changes the row's emailed status. A suppressed
    address is still stopped, by the sending path.
    """

    throttle_scope = "internal"  # A load limit; access is the shared secret.
    authentication_classes = []
    permission_classes = [IsInternalApiRequest]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = SeoMessageSendSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        attachments = read_uploads(request.FILES.getlist("attachments"))
        message = send(
            to=data["to"],
            channel="email",
            message_type="seo_followup",
            subject=data["subject"],
            body=data["body"],
            plain=True,
            attachments=attachments,
            related=SeoProspect.objects.filter(email=data["to"]).first(),
            sender=settings.OUTREACH_SENDER,
            meta={"composed_by": "internal-api"},
        )
        body = {
            "id": message.pk, "status": message.status, "to": message.to, "subject": message.subject,
            "attachments": message.attachments,
        }
        if message.status == Message.Status.SUPPRESSED:
            return Response({"detail": "The message was not sent: the address is on the suppression list.", **body},
                            status=status.HTTP_409_CONFLICT)
        if message.status == Message.Status.FAILED:
            return Response({"detail": f"The message was not sent and is recorded as failed: {message.error_message}",
                             **body}, status=status.HTTP_502_BAD_GATEWAY)
        return Response(body, status=status.HTTP_201_CREATED)


class AdminSeoProspectListView(ListAPIView):
    throttle_scope = "staff"  # Runaway-client limit; access is gated by the permission class.
    permission_classes = [IsAdminUser]
    serializer_class = AdminSeoProspectSerializer
    pagination_class = DashboardPagination

    def get_queryset(self):
        params = self.request.query_params
        queryset = with_status(SeoProspect.objects.all())
        for field in ("status", "reply"):
            values = _csv(params, field)
            if values:
                queryset = queryset.filter(**{f"{field}__in": values})
        called = params.get("called", "")
        if called in ("yes", "no"):
            queryset = queryset.filter(called_at__isnull=called == "no")
        search = params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(business__icontains=search) | Q(domain__icontains=search) | Q(email__icontains=search)
            )
        if "ordering" not in params:
            # The calls list: not yet called first, then the earliest sent.
            return queryset.order_by("called_at", "sent_at", "created_at")
        return apply_ordering(queryset, params, PROSPECT_ORDERING)


class AdminSeoProspectDetailView(RetrieveUpdateAPIView):
    throttle_scope = "staff"  # Runaway-client limit; access is gated by the permission class.
    permission_classes = [IsAdminUser]
    serializer_class = AdminSeoProspectSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        return with_status(SeoProspect.objects.all())

    def perform_update(self, serializer):
        serializer.save()
        # The composed status was annotated before the change; answer with the one after it.
        serializer.instance = self.get_queryset().get(pk=serializer.instance.pk)


class AdminSeoProspectUnsubscribeView(APIView):
    """For the replies that say "no thanks": the address goes on the suppression list."""

    throttle_scope = "staff"
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        prospect = SeoProspect.objects.filter(pk=pk).first()
        if prospect is None:
            return Response({"detail": "Not found."}, status=404)
        suppress(prospect.email, reason=Suppression.Reason.OPTED_OUT)
        if prospect.reply == SeoProspect.Reply.NONE:
            prospect.reply = SeoProspect.Reply.NEGATIVE
            prospect.save(update_fields=["reply", "updated_at"])
        return Response(AdminSeoProspectSerializer(with_status(SeoProspect.objects.all()).get(pk=pk)).data)


class AdminSeoProspectSummaryView(APIView):
    """Per subject, and per body: how many are queued, where the sent ones got to, replies and calls."""

    throttle_scope = "staff"
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({
            "subjects": self.tallies("subject_version", SeoProspect.Subject.choices),
            "bodies": self.tallies("body_version", SeoProspect.Body.choices),
        })

    @staticmethod
    def tallies(field, choices):
        summary = {
            value: {field: value, "label": label, "total": 0, "positive": 0, "called": 0, **{s: 0 for s in STATUSES}}
            for value, label in choices
        }
        for row in with_status(SeoProspect.objects.all()).values(field, "status").annotate(n=Count("id")):
            entry = summary[row[field]]
            entry[row["status"]] = entry.get(row["status"], 0) + row["n"]
            entry["total"] += row["n"]
        counts = SeoProspect.objects.values(field).annotate(
            positive=Count("id", filter=Q(reply=SeoProspect.Reply.POSITIVE)),
            called=Count("id", filter=Q(called_at__isnull=False)),
        )
        for row in counts:
            summary[row[field]].update(positive=row["positive"], called=row["called"])
        return list(summary.values())
