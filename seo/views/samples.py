import hashlib
import json

from django.db import IntegrityError
from django.utils import timezone
from freetheplatform.messaging import is_suppressed
from rest_framework import serializers, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from affiliates.utils.permissions import IsInternalApiRequest

from ..models import SeoProspect, SeoSampleReport
from ..utils.sample_links import sample_link
from ..utils.sample_sending import (
    TITLES_SHOWN, body_for, follow_up_refusal, hold_problems, subject_for,
)

#: A report page is one self-contained HTML file, its screenshots inline; a few MB each.
MAX_REPORT_BYTES = 25 * 1024 * 1024


def _sha256(field) -> str:
    """A stored page's hash, read in chunks."""
    digest = hashlib.sha256()
    field.open("rb")
    try:
        for chunk in field.chunks():
            digest.update(chunk)
    finally:
        field.close()
    return digest.hexdigest()


def _upload_sha256(upload) -> str:
    """An uploaded page's hash, left ready to be saved."""
    digest = hashlib.sha256()
    for chunk in upload.chunks():
        digest.update(chunk)
    upload.seek(0)
    return digest.hexdigest()


def stored_sha256(sample: SeoSampleReport) -> str:
    """The page as stored: the row's record of it, or read from the file for a row uploaded before it was kept."""
    if not sample.page_sha256 and sample.report_html:
        sample.page_sha256 = _sha256(sample.report_html)
        SeoSampleReport.objects.filter(pk=sample.pk).update(page_sha256=sample.page_sha256)
    return sample.page_sha256


def _flag(request, name: str) -> bool:
    return str(request.data.get(name, "")).lower() in ("1", "true", "yes")


def _outreach(sample: SeoSampleReport) -> dict:
    """What the outbox shows of a row's email."""
    return {
        "project": sample.project, "link": sample_link(sample), "email": sample.email,
        "held_at": sample.held_at, "approved_at": sample.approved_at, "sent_at": sample.sent_at,
        "follow_up_queued_at": sample.follow_up_queued_at, "followed_up_at": sample.followed_up_at,
        "page_sha256": stored_sha256(sample),
        **({"subject": subject_for(sample), "body": body_for(sample)} if sample.held_at else {}),
    }


class SampleUploadSerializer(serializers.Serializer):
    project = serializers.RegexField(r"^[a-z0-9][a-z0-9-]{0,63}$")
    business = serializers.CharField(max_length=255)
    domain = serializers.CharField(max_length=255, required=False, allow_blank=True)
    demo_url = serializers.URLField(max_length=500)
    report_html = serializers.FileField()

    def validate_report_html(self, value):
        if value.size > MAX_REPORT_BYTES:
            raise serializers.ValidationError("The report page is too large.")
        if not value.name.lower().endswith(".html"):
            raise serializers.ValidationError("The report must be an .html page.")
        return value


class SeoSampleUploadView(APIView):
    """`POST /api/seo/samples/`: a sample's companion report, from ``publish.py`` each time the demos go up.

    A new project gets a row and a link (``/reports/<business>-<token>``); a project already here has its page and
    details replaced and keeps its link, so a link already sent stays good. Nothing is emailed from here. A row
    approved and not yet sent whose page, business or domain changes is held again (``held_again``), so what goes
    out is what the owner read. Answers the link.
    """

    throttle_scope = "internal"  # A load limit; access is the shared secret.
    authentication_classes = []
    permission_classes = [IsInternalApiRequest]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        upload = SampleUploadSerializer(data=request.data)
        upload.is_valid(raise_exception=True)
        data = upload.validated_data
        sample = SeoSampleReport.objects.filter(project=data["project"]).first()
        created = sample is None
        if created:
            sample = SeoSampleReport(project=data["project"])
        before = (stored_sha256(sample), sample.business, sample.domain) if not created else None
        sample.business = data["business"]
        sample.domain = data.get("domain", "")
        sample.demo_url = data["demo_url"]
        sample.page_sha256 = _upload_sha256(data["report_html"])
        old = sample.report_html.name if sample.report_html else ""
        sample.report_html.save(f"sample_{data['project']}.html", data["report_html"], save=False)
        held_again = bool(before and sample.approved_at and not sample.sent_at
                          and before != (sample.page_sha256, sample.business, sample.domain))
        if held_again:
            sample.approved_at = None
        sample.save()
        if old and old != sample.report_html.name:
            sample.report_html.storage.delete(old)
        return Response(
            {"outcome": "created" if created else "replaced", "link": sample_link(sample), "held_again": held_again},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class SampleHoldSerializer(serializers.Serializer):
    project = serializers.RegexField(r"^[a-z0-9][a-z0-9-]{0,63}$")
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=60, required=False, allow_blank=True)
    contact_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    email_source = serializers.CharField(max_length=500, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=40, required=False, allow_blank=True)
    domain = serializers.CharField(max_length=255)
    # The report's first four change titles, in its order: a JSON list, or the field repeated.
    titles = serializers.ListField(child=serializers.CharField(max_length=300), min_length=TITLES_SHOWN)

    def to_internal_value(self, data):
        if hasattr(data, "getlist"):
            raw = data.getlist("titles")
            data = {key: data.get(key) for key in data}
            data["titles"] = json.loads(raw[0]) if len(raw) == 1 and raw[0].startswith("[") else raw
        return super().to_internal_value(data)

    def validate_email(self, value):
        return value.strip().lower()

    def validate_domain(self, value):
        value = value.strip().lower().removeprefix("https://").removeprefix("http://").split("/")[0]
        return value.removeprefix("www.")


class SeoSampleHoldView(APIView):
    """`POST /api/seo/samples/hold/`: a published sample put in the outbox, held for the owner's word.

    Sets the contact and the four titles on the project's row and answers the subject and body as they would go.
    Nothing is emailed until ``SeoSampleApproveView`` records the owner's word. One email per business: an address or
    domain another sample holds, or a prospect report row holds, is refused with 409, as is a suppressed address and
    a sample already sent. A held row may be held again with new details; an approved one is held again by it.
    """

    throttle_scope = "internal"  # A load limit; access is the shared secret.
    authentication_classes = []
    permission_classes = [IsInternalApiRequest]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        hold = SampleHoldSerializer(data=request.data)
        hold.is_valid(raise_exception=True)
        data = hold.validated_data
        sample = SeoSampleReport.objects.filter(project=data["project"]).first()
        if sample is None:
            return Response({"outcome": "unknown", "detail": "No sample has this project: publish it first."},
                            status=status.HTTP_404_NOT_FOUND)
        if sample.sent_at:
            return Response({"outcome": "already_sent", "sent_at": sample.sent_at}, status=status.HTTP_409_CONFLICT)
        email, domain = data["email"], data["domain"]
        others = SeoSampleReport.objects.exclude(pk=sample.pk).filter(held_at__isnull=False)
        for field, value in (("email", email), ("domain", domain)):
            if others.filter(**{field: value}).exists():
                return Response({"outcome": "already_known", "field": field,
                                 "detail": f"Another sample holds this {field}."}, status=status.HTTP_409_CONFLICT)
            if SeoProspect.objects.filter(**{field: value}).exists():
                return Response({"outcome": "already_known", "field": field,
                                 "detail": f"A prospect report row holds this {field}."},
                                status=status.HTTP_409_CONFLICT)
        if is_suppressed(email):
            return Response({"outcome": "suppressed", "detail": "The address is on the suppression list."},
                            status=status.HTTP_409_CONFLICT)
        sample.email = email
        sample.domain = domain
        sample.first_name = data["first_name"].strip()
        sample.contact_name = data.get("contact_name", "").strip()
        sample.email_source = data.get("email_source", "")
        sample.phone = data.get("phone", "")
        sample.titles = [t.strip() for t in data["titles"]][:TITLES_SHOWN]
        sample.held_at = sample.held_at or timezone.now()
        sample.approved_at = None
        try:
            sample.save()
        except IntegrityError:
            return Response({"outcome": "already_known", "field": "email",
                             "detail": "Another sample holds this email."}, status=status.HTTP_409_CONFLICT)
        return Response({"outcome": "held", **_outreach(sample)}, status=status.HTTP_201_CREATED)


class SeoSampleApproveView(APIView):
    """`POST /api/seo/samples/approve/`: the owner's word on a held sample, by project.

    ``approved`` 1 (the default) marks it approved and the next hourly run sends it; 0 takes the word back.
    ``page_sha256``, required to approve, must be the stored page's: the owner approves the page they read. Refused
    with 409 for a sample not held, already sent, or missing what the email needs.
    """

    throttle_scope = "internal"  # A load limit; access is the shared secret.
    authentication_classes = []
    permission_classes = [IsInternalApiRequest]

    def post(self, request):
        sample = SeoSampleReport.objects.filter(project=str(request.data.get("project", ""))).first()
        if sample is None:
            return Response({"outcome": "unknown", "detail": "No sample has this project."},
                            status=status.HTTP_404_NOT_FOUND)
        if sample.sent_at:
            return Response({"outcome": "already_sent", "sent_at": sample.sent_at}, status=status.HTTP_409_CONFLICT)
        if not sample.held_at:
            return Response({"outcome": "not_held", "detail": "Hold it first: the row has no contact."},
                            status=status.HTTP_409_CONFLICT)
        approved = str(request.data.get("approved", "1")).lower() not in ("0", "false", "no")
        if approved:
            if missing := hold_problems(sample):
                return Response({"outcome": "incomplete", "missing": missing}, status=status.HTTP_409_CONFLICT)
            if str(request.data.get("page_sha256", "")) != stored_sha256(sample):
                return Response({"outcome": "page_changed",
                                 "detail": "The page named is not the one uploaded: publish, then approve."},
                                status=status.HTTP_409_CONFLICT)
        sample.approved_at = timezone.now() if approved else None
        sample.save(update_fields=["approved_at", "updated_at"])
        return Response({"outcome": "approved" if approved else "held", **_outreach(sample)},
                        status=status.HTTP_201_CREATED)


class SeoSampleFollowUpView(APIView):
    """`POST /api/seo/samples/follow-up/`: queue the follow-up for a sent sample, on the owner's word, by project.

    The hourly run sends it in the window: the same subject and email, opening "Just following up on my previous
    email, in case it got buried." Refused with 409 and the reason when not sent, already queued or followed up
    (``again`` lifts the last), excluded or suppressed. No wait: the owner's word is the only trigger.
    """

    throttle_scope = "internal"  # A load limit; access is the shared secret.
    authentication_classes = []
    permission_classes = [IsInternalApiRequest]

    def post(self, request):
        sample = SeoSampleReport.objects.filter(project=str(request.data.get("project", ""))).first()
        if sample is None:
            return Response({"outcome": "unknown", "detail": "No sample has this project."},
                            status=status.HTTP_404_NOT_FOUND)
        if refusal := follow_up_refusal(sample, again=_flag(request, "again")):
            return Response({"outcome": refusal, "sent_at": sample.sent_at,
                             "follow_up_queued_at": sample.follow_up_queued_at}, status=status.HTTP_409_CONFLICT)
        sample.follow_up_queued_at = timezone.now()
        sample.followed_up_at = None
        sample.save(update_fields=["follow_up_queued_at", "followed_up_at", "updated_at"])
        return Response({"outcome": "queued", "subject": subject_for(sample), "sent_at": sample.sent_at},
                        status=status.HTTP_201_CREATED)


def sample_holds(email: str, domain: str) -> str:
    """The field a held sample shares with a prospect about to be uploaded, for the prospect upload's refusal."""
    held = SeoSampleReport.objects.filter(held_at__isnull=False)
    if held.filter(email=email).exists():
        return "email"
    if domain and held.filter(domain=domain).exists():
        return "domain"
    return ""
