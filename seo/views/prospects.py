from django.db import IntegrityError, transaction
from django.db.models import Count, Q
from django.conf import settings
from django.http import FileResponse, Http404, HttpResponse, HttpResponseRedirect
from django.utils import timezone
from freetheplatform.messaging import Message, Suppression, is_suppressed, send, suppress
from freetheplatform.messaging.utils import read_uploads
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from affiliates.utils.permissions import IsInternalApiRequest
from core.utils.ordering import apply_ordering
from core.utils.pagination import DashboardPagination

from ..models import SeoProspect, SeoProspectOpen
from ..serializers.prospect import (
    AdminSeoProspectSerializer, SeoMessageSendSerializer, SeoProspectHtmlSerializer, SeoProspectUploadSerializer,
)
from ..utils.prospect_links import (
    link_key, page_document, page_headers, pdf_link, record_open, report_link, token_of,
)
from ..utils.prospect_sending import (
    NoSubject, follow_up_refusal, follow_up_subject_for, next_body, next_follow_up_subject, next_subject,
    subject_for,
)
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
    """`POST /api/seo/prospects/`: a published prospect report, held for the owner's approval.

    The row gives the report its link (``/reports/<business>-<token>``), which the owner reads
    it at; the subject and body are chosen now, so the outbox can say what
    will go; nothing is emailed until ``SeoProspectApproveView`` records the
    owner's word. One report per business: a domain, slug or address already
    here is refused with 409 and the row is left as it is, so a pipeline run
    that posts twice never holds two. A suppressed address is refused too.
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
        html = data.pop("report_html", None)
        cover = data.pop("report_cover", None)
        # A report that went by hand, registered for its link and its dashboard row: created sent, never queued,
        # and approved by the fact of it.
        went = "sent_at" in data
        if went:
            subject_version, body_version = data.pop("subject_version"), data.pop("body_version")
            data["approved_at"] = data["sent_at"]
        else:
            try:
                subject_version = next_subject(has_search=bool(data.get("paid_searches")),
                                               purpose=data.get("purpose", SeoProspect.Purpose.CLIENT))
            except NoSubject as error:
                return Response({"outcome": "no_subject", "detail": str(error)}, status=status.HTTP_400_BAD_REQUEST)
            body_version = next_body(data.get("purpose", SeoProspect.Purpose.CLIENT))
        try:
            with transaction.atomic():
                prospect = SeoProspect(**data, subject_version=subject_version, body_version=body_version)
                prospect.report_pdf.save(f"{data['slug']}_{data['report_version']}.pdf", pdf, save=False)
                if html is not None:
                    prospect.report_html.save(f"{data['slug']}_{data['report_version']}.html", html, save=False)
                if cover is not None:
                    prospect.report_cover.save(_cover_name(prospect, cover), cover, save=False)
                prospect.save()
        except IntegrityError:
            # Two posts of the same report at once; the first one won.
            return Response({"outcome": "already_known", "detail": "A prospect with these details exists."},
                            status=status.HTTP_409_CONFLICT)
        return Response(
            {"outcome": "registered" if went else "held", "id": prospect.pk, "purpose": prospect.purpose,
             "subject_version": prospect.subject_version, "subject": subject_for(prospect),
             "body_version": prospect.body_version, "body_label": prospect.get_body_version_display(),
             "report_link": report_link(prospect), "report_html_ready": bool(prospect.report_html)},
            status=status.HTTP_201_CREATED,
        )


class SeoProspectApproveView(APIView):
    """`POST /api/seo/prospects/approve/`: the owner's word on a held report, by slug (``outbox.py approve``).

    ``approved`` 1 (the default) marks the row approved and the next hourly
    run sends it; 0 takes the word back (``outbox.py unapprove``, or a report
    edited after approval) and the row is held again. A report already sent
    is refused with 409 either way: there is nothing left to hold. ``metric``,
    when given, is what the business counts, for the second body's bet.
    """

    throttle_scope = "internal"  # A load limit; access is the shared secret.
    authentication_classes = []
    permission_classes = [IsInternalApiRequest]

    def post(self, request):
        prospect = SeoProspect.objects.filter(slug=str(request.data.get("slug", ""))).first()
        if prospect is None:
            return Response({"outcome": "unknown", "detail": "No prospect has this slug."},
                            status=status.HTTP_404_NOT_FOUND)
        if prospect.sent_at is not None:
            return Response({"outcome": "already_sent", "sent_at": prospect.sent_at}, status=status.HTTP_409_CONFLICT)
        approved = str(request.data.get("approved", "1")).lower() not in ("0", "false", "no")
        prospect.approved_at = timezone.now() if approved else None
        fields = ["approved_at", "updated_at"]
        metric = str(request.data.get("metric", "")).strip()
        if metric:
            prospect.metric = metric[:40]
            fields.append("metric")
        prospect.save(update_fields=fields)
        return Response({"outcome": "approved" if approved else "held", "id": prospect.pk,
                         "approved_at": prospect.approved_at, "metric": prospect.metric,
                         "subject_version": prospect.subject_version, "subject": subject_for(prospect),
                         "body_version": prospect.body_version, "body_label": prospect.get_body_version_display(),
                         "purpose": prospect.purpose, "report_link": report_link(prospect),
                         "report_html_ready": bool(prospect.report_html)},
                        status=status.HTTP_201_CREATED)


class SeoProspectHtmlView(APIView):
    """`POST /api/seo/prospects/html/`: the report page for a prospect the server already holds, by slug.

    For the reports uploaded before the page existed (``outbox.py html``), and a
    page re-rendered after a small edit. Replaces the file, and the PDF when one
    is sent with it, so the page's PDF link serves the same version; the link
    does not change.
    """

    throttle_scope = "internal"  # A load limit; access is the shared secret.
    authentication_classes = []
    permission_classes = [IsInternalApiRequest]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        upload = SeoProspectHtmlSerializer(data=request.data)
        upload.is_valid(raise_exception=True)
        prospect = SeoProspect.objects.filter(slug=upload.validated_data["slug"]).first()
        if prospect is None:
            return Response({"outcome": "unknown", "detail": "No prospect has this slug."},
                            status=status.HTTP_404_NOT_FOUND)
        if prospect.report_html:
            prospect.report_html.delete(save=False)
        prospect.report_html.save(
            f"{prospect.slug}_{prospect.report_version}.html", upload.validated_data["report_html"], save=False
        )
        pdf = upload.validated_data.get("report_pdf")
        if pdf is not None:
            if prospect.report_pdf:
                prospect.report_pdf.delete(save=False)
            prospect.report_pdf.save(f"{prospect.slug}_{prospect.report_version}.pdf", pdf, save=False)
        cover = upload.validated_data.get("report_cover")
        if cover is not None:
            if prospect.report_cover:
                prospect.report_cover.delete(save=False)
            prospect.report_cover.save(_cover_name(prospect, cover), cover, save=False)
        for field in ("issues", "recommendation_count"):
            if field in upload.validated_data:
                setattr(prospect, field, upload.validated_data[field])
        prospect.save()
        return Response({"outcome": "attached", "id": prospect.pk, "report_link": report_link(prospect),
                         "pdf_replaced": pdf is not None, "cover_replaced": cover is not None},
                        status=status.HTTP_201_CREATED)


def _cover_name(prospect, upload) -> str:
    """The stored name of the link's preview picture, keeping the extension it came with (JPEG or PNG)."""
    extension = ".png" if str(upload.name).lower().endswith(".png") else ".jpg"
    return f"{prospect.slug}_{prospect.report_version}_cover{extension}"


def _by_key(key: str) -> SeoProspect:
    """The prospect a link's path segment names by its token, or 404."""
    prospect = SeoProspect.objects.filter(link_token=token_of(key)).first()
    if prospect is None:
        raise Http404
    return prospect


def _sent_on(request, key: str, prospect: SeoProspect, address: str):
    """A link with the token alone (the first links went out so) or under another name: sent on to the named
    address, the query kept, so the open is logged once, there. None when the key is already the named one."""
    if key == link_key(prospect):
        return None
    query = request.META.get("QUERY_STRING", "")
    return page_headers(HttpResponseRedirect(f"{address}?{query}" if query else address))


class SeoReportPageView(APIView):
    """`GET /api/seo/r/<key>/`, served at ``/reports/<business>-<token>`` by the site: the report as a page, for the link.

    No sign-in: the token is the key, and the page is noindexed, linked from
    nowhere, and never cached between. Each open is logged against the
    prospect with where the link came from (``?s=``). A row from before the
    page existed serves its PDF inline instead.
    """

    throttle_scope = "report"
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, key):
        prospect = _by_key(key)
        if sent_on := _sent_on(request, key, prospect, report_link(prospect)):
            return sent_on
        if not prospect.report_html:
            return _pdf_response(prospect, request)
        record_open(prospect, request, SeoProspectOpen.Kind.PAGE)
        with prospect.report_html.open("rb") as handle:
            document = handle.read().decode("utf-8")
        return page_headers(HttpResponse(page_document(prospect, document), content_type="text/html; charset=utf-8"))


class SeoReportPdfView(APIView):
    """`GET /api/seo/r/<key>/pdf/`, at ``/reports/<business>-<token>/pdf``: the same report's PDF, inline, logged as
    an open."""

    throttle_scope = "report"
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, key):
        prospect = _by_key(key)
        if sent_on := _sent_on(request, key, prospect, pdf_link(prospect)):
            return sent_on
        return _pdf_response(prospect, request)


class SeoReportCoverView(APIView):
    """`GET /api/seo/r/<key>/cover.jpg/`, at ``/reports/<business>-<token>/cover.jpg``: the picture a chat or text
    app shows beside the link (the page's og:image). Public and cacheable, unlike the page: the apps fetch it apart
    from the page, and a refused or uncacheable picture leaves the link bare. Not logged: no person opens it."""

    throttle_scope = "report"
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, key):
        prospect = _by_key(key)
        if not prospect.report_cover:
            raise Http404
        png = prospect.report_cover.name.lower().endswith(".png")
        response = FileResponse(prospect.report_cover.open("rb"), content_type="image/png" if png else "image/jpeg")
        response["X-Robots-Tag"] = "noindex"
        response["Cache-Control"] = "public, max-age=86400"
        return response


def _pdf_response(prospect, request):
    record_open(prospect, request, SeoProspectOpen.Kind.PDF)
    response = FileResponse(
        prospect.report_pdf.open("rb"), content_type="application/pdf", as_attachment=False,
        filename=f"{prospect.slug}_seo_report_{prospect.report_version}.pdf",
    )
    return page_headers(response)


class SeoProspectFollowUpView(APIView):
    """`POST /api/seo/prospects/follow-up/`: queue the follow-up for a prospect, by slug.

    The outreach agent queues it at startup once it has looked for a reply in
    the owner's inbox; the hourly run sends it in the window. Refused with 409
    and the reason when it is too soon, already queued, or anything has since
    stopped it: a call, a reply marked on the dashboard, an exclusion or the
    suppression list. ``early`` (the owner's word) lifts the week's wait and
    nothing else; ``again`` (the owner's word, 2026-11-11) queues another
    after one has gone, under a subject neither email has used.
    """

    throttle_scope = "internal"  # A load limit; access is the shared secret.
    authentication_classes = []
    permission_classes = [IsInternalApiRequest]

    def post(self, request):
        prospect = SeoProspect.objects.filter(slug=str(request.data.get("slug", ""))).first()
        if prospect is None:
            return Response({"outcome": "unknown", "detail": "No prospect has this slug."},
                            status=status.HTTP_404_NOT_FOUND)
        now = timezone.now()
        early = str(request.data.get("early", "")).lower() in ("1", "true", "yes")
        again = str(request.data.get("again", "")).lower() in ("1", "true", "yes")
        refusal = follow_up_refusal(prospect, now, early=early, again=again)
        if refusal:
            return Response({"outcome": refusal, "sent_at": prospect.sent_at,
                             "follow_up_queued_at": prospect.follow_up_queued_at},
                            status=status.HTTP_409_CONFLICT)
        prospect.follow_up_queued_at = now
        # The earlier follow-up's send stays in the message log; the row now waits on this one.
        prospect.followed_up_at = None
        prospect.follow_up_subject_version = next_follow_up_subject(prospect)
        prospect.follow_up_body_version = next_body(prospect.purpose)
        prospect.save(update_fields=["follow_up_queued_at", "followed_up_at", "follow_up_subject_version",
                                     "follow_up_body_version", "updated_at"])
        return Response({"outcome": "queued", "subject": follow_up_subject_for(prospect),
                         "subject_version": prospect.follow_up_subject_version,
                         "body_version": prospect.follow_up_body_version, "sent_at": prospect.sent_at},
                        status=status.HTTP_201_CREATED)


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
