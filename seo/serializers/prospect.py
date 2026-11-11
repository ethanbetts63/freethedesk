from freetheplatform.security import bounds
from rest_framework import serializers

from ..models import SeoProspect
from ..utils.prospect_links import report_link
from ..utils.prospect_sending import body_for, subject_for

# A prospect report runs to about 2 MB; Mailgun's ceiling is 25 MB for the whole send.
MAX_PDF_BYTES = 15 * 1024 * 1024


class SeoMessageSendSerializer(serializers.Serializer):
    """One email written on the local machine and sent as given (multipart). ``attachments`` are read from the
    request's files by the view, because a multipart request repeats the key once per file."""

    to = serializers.EmailField()
    subject = serializers.CharField(max_length=500)
    body = serializers.CharField(max_length=10000)

    def validate_to(self, value):
        return value.strip().lower()

    def validate_subject(self, value):
        return value.strip()

    def validate_body(self, value):
        if not value.strip():
            raise serializers.ValidationError("An email body is required.")
        return value.strip()


class SeoProspectUploadSerializer(serializers.Serializer):
    """One published prospect report, as the pipeline's ``outbox.py release`` posts it (multipart).

    No email body: the server composes every body from these fields. ``body``
    is still taken, blank, from an older outbox.
    """

    domain = serializers.CharField(max_length=255)
    business = serializers.CharField(max_length=255)
    slug = serializers.SlugField(max_length=64)
    report_version = serializers.CharField(max_length=16)
    report_path = serializers.CharField(max_length=500)
    report_pdf = serializers.FileField()
    # The same report as a page, for the link; an outbox from before the link existed sends none.
    report_html = serializers.FileField(required=False)
    # The link's preview picture (the page's og:image), rendered beside the PDF; optional the same way.
    report_cover = serializers.FileField(required=False)
    contact_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    email = serializers.EmailField()
    email_source = serializers.URLField(max_length=500, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=40, required=False, allow_blank=True)
    overview = serializers.CharField(max_length=300)
    issues = serializers.ListField(child=serializers.CharField(max_length=300), max_length=10)
    paid_searches = serializers.ListField(
        child=serializers.CharField(max_length=200), max_length=10, required=False
    )
    recommendation_count = serializers.IntegerField(min_value=1, max_value=50)
    # A business we hope will buy the full report, or a podcast host we hope will join the affiliate program.
    purpose = serializers.ChoiceField(choices=SeoProspect.Purpose.choices, required=False,
                                      default=SeoProspect.Purpose.CLIENT)
    body = serializers.CharField(max_length=10000, required=False, allow_blank=True, default="")
    # What the business counts, for the second body's bet.
    metric = serializers.CharField(max_length=40, required=False, default="bookings")
    # A report that went by hand before the server kept prospects (``outbox.py register``): the row is created
    # already sent, under the subject and body it went with, so it gets a link and a dashboard row and is never
    # sent by the run. Absent on every report the run sends.
    sent_at = serializers.DateTimeField(required=False)
    subject_version = serializers.ChoiceField(choices=SeoProspect.Subject.choices, required=False)
    body_version = serializers.ChoiceField(choices=SeoProspect.Body.choices, required=False)

    def validate_domain(self, value):
        return value.strip().lower().removeprefix("www.")

    def validate_email(self, value):
        return value.strip().lower()

    def validate_report_pdf(self, value):
        return validate_report_pdf(value)

    def validate_report_html(self, value):
        return validate_report_html(value)

    def validate_report_cover(self, value):
        return validate_report_cover(value)

    def validate(self, data):
        if "sent_at" in data and ("subject_version" not in data or "body_version" not in data):
            raise serializers.ValidationError("A report that already went names the subject and body it went with.")
        return data


def validate_report_pdf(value):
    """The report's PDF, as render prints it."""
    if value.size > MAX_PDF_BYTES:
        raise serializers.ValidationError("The report is larger than 15 MB.")
    head = value.read(5)
    value.seek(0)
    if head != b"%PDF-":
        raise serializers.ValidationError("The report is not a PDF.")
    return value


def validate_report_html(value):
    """The report page: one self-contained HTML document, as render writes it."""
    if value.size > MAX_PDF_BYTES:
        raise serializers.ValidationError("The report page is larger than 15 MB.")
    head = value.read(64).lstrip().lower()
    value.seek(0)
    if not (head.startswith(b"<!doctype html") or head.startswith(b"<html")):
        raise serializers.ValidationError("The report page is not an HTML document.")
    return value


#: A link preview picture is one JPEG or PNG, small: the chat and text apps fetch it on every send and give up on
#: a large one (WhatsApp past about 300 KB; nothing accepts megabytes).
MAX_COVER_BYTES = 2 * 1024 * 1024


def validate_report_cover(value):
    """The link's preview picture: a JPEG or PNG, as render takes it."""
    if value.size > MAX_COVER_BYTES:
        raise serializers.ValidationError("The preview picture is larger than 2 MB.")
    head = value.read(8)
    value.seek(0)
    if not (head.startswith(b"\xff\xd8\xff") or head.startswith(b"\x89PNG\r\n\x1a\n")):
        raise serializers.ValidationError("The preview picture is not a JPEG or a PNG.")
    return value


class SeoProspectHtmlSerializer(serializers.Serializer):
    """The report page for a prospect the server already holds (``outbox.py html``), and the PDF printed with it, so
    the page's PDF link serves the same version as the page."""

    slug = serializers.SlugField(max_length=64)
    report_html = serializers.FileField()
    report_pdf = serializers.FileField(required=False)
    report_cover = serializers.FileField(required=False)
    # The report's titles and count as they stand now, so the email lists what the page holds after a cut.
    issues = serializers.ListField(child=serializers.CharField(max_length=300), max_length=10, required=False)
    recommendation_count = serializers.IntegerField(min_value=1, max_value=50, required=False)

    def validate_report_html(self, value):
        return validate_report_html(value)

    def validate_report_cover(self, value):
        return validate_report_cover(value)

    def validate_report_pdf(self, value):
        return validate_report_pdf(value)


class AdminSeoProspectSerializer(serializers.ModelSerializer):
    """A prospect as the calls list shows it. Only the owner's fields are written."""

    status = serializers.CharField(read_only=True)
    message_id = serializers.IntegerField(read_only=True, allow_null=True)
    subject = serializers.SerializerMethodField()
    subject_label = serializers.CharField(source="get_subject_version_display", read_only=True)
    body_label = serializers.CharField(source="get_body_version_display", read_only=True)
    email_body = serializers.SerializerMethodField()
    reply_label = serializers.CharField(source="get_reply_display", read_only=True)
    # The report's link, whether it serves the page or (a row from before the page) the PDF, and its opens by
    # people, previews and crawlers counted apart (``with_status`` annotates them).
    report_link = serializers.SerializerMethodField()
    report_html_ready = serializers.SerializerMethodField()
    opens = serializers.IntegerField(source="open_count", read_only=True, default=0)
    last_opened_at = serializers.DateTimeField(read_only=True, default=None)

    class Meta:
        model = SeoProspect
        fields = [
            "id", "domain", "business", "slug", "report_version", "report_path", "contact_name",
            "email", "email_source", "phone", "overview", "issues", "paid_searches",
            "recommendation_count", "purpose", "subject_version", "subject_label", "subject",
            "body_version", "body_label", "metric", "body", "email_body",
            "approved_at", "sent_at", "status", "message_id", "follow_up_queued_at", "followed_up_at",
            "follow_up_subject_version", "follow_up_body_version",
            "report_link", "report_html_ready", "opens", "last_opened_at",
            "called_at", "call_notes", "reply", "reply_label",
            "excluded_reason", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "domain", "business", "slug", "report_version", "report_path", "contact_name",
            "email", "email_source", "phone", "overview", "issues", "paid_searches",
            "recommendation_count", "purpose", "subject_version", "subject_label", "subject",
            "body_version", "body_label", "metric", "body", "email_body",
            "approved_at", "sent_at", "status", "message_id", "follow_up_queued_at", "followed_up_at",
            "follow_up_subject_version", "follow_up_body_version", "reply_label",
            "report_link", "report_html_ready", "opens", "last_opened_at",
            "created_at", "updated_at",
        ]
        # TextField columns, which DRF maps to a CharField with no maximum.
        extra_kwargs = {
            "call_notes": {"max_length": bounds.FIELD_MAX["note"]},
            "excluded_reason": {"max_length": bounds.FIELD_MAX["note"]},
        }

    def get_subject(self, obj) -> str:
        return subject_for(obj)

    def get_report_link(self, obj) -> str:
        return report_link(obj)

    def get_report_html_ready(self, obj) -> bool:
        return bool(obj.report_html)

    def get_email_body(self, obj) -> str:
        """The body as it goes, or went, composed from the row."""
        return body_for(obj)
