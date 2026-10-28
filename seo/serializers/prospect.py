from freetheplatform.security import bounds
from rest_framework import serializers

from ..models import SeoProspect
from ..utils.prospect_sending import subject_for

# A prospect report runs to about 2 MB; Mailgun's ceiling is 25 MB for the whole send.
MAX_PDF_BYTES = 15 * 1024 * 1024


class SeoProspectUploadSerializer(serializers.Serializer):
    """One published prospect report, as the pipeline's ``send.py`` posts it (multipart)."""

    domain = serializers.CharField(max_length=255)
    business = serializers.CharField(max_length=255)
    slug = serializers.SlugField(max_length=64)
    report_version = serializers.CharField(max_length=16)
    report_path = serializers.CharField(max_length=500)
    report_pdf = serializers.FileField()
    contact_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    email = serializers.EmailField()
    email_source = serializers.URLField(max_length=500, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=40, required=False, allow_blank=True)
    overview = serializers.CharField(max_length=300)
    issues = serializers.ListField(child=serializers.CharField(max_length=300), max_length=10)
    paid_searches = serializers.ListField(
        child=serializers.CharField(max_length=200), max_length=10, required=False
    )
    hours = serializers.IntegerField(min_value=1, max_value=100)
    recommendation_count = serializers.IntegerField(min_value=1, max_value=50)
    body = serializers.CharField(max_length=10000)

    def validate_domain(self, value):
        return value.strip().lower().removeprefix("www.")

    def validate_email(self, value):
        return value.strip().lower()

    def validate_report_pdf(self, value):
        if value.size > MAX_PDF_BYTES:
            raise serializers.ValidationError("The report is larger than 15 MB.")
        head = value.read(5)
        value.seek(0)
        if head != b"%PDF-":
            raise serializers.ValidationError("The report is not a PDF.")
        return value


class AdminSeoProspectSerializer(serializers.ModelSerializer):
    """A prospect as the calls list shows it. Only the owner's fields are written."""

    status = serializers.CharField(read_only=True)
    message_id = serializers.IntegerField(read_only=True, allow_null=True)
    subject = serializers.SerializerMethodField()
    subject_label = serializers.CharField(source="get_subject_version_display", read_only=True)
    reply_label = serializers.CharField(source="get_reply_display", read_only=True)

    class Meta:
        model = SeoProspect
        fields = [
            "id", "domain", "business", "slug", "report_version", "report_path", "contact_name",
            "email", "email_source", "phone", "overview", "issues", "paid_searches", "hours",
            "recommendation_count", "subject_version", "subject_label", "subject", "body",
            "sent_at", "status", "message_id", "called_at", "call_notes", "reply", "reply_label",
            "excluded_reason", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "domain", "business", "slug", "report_version", "report_path", "contact_name",
            "email", "email_source", "phone", "overview", "issues", "paid_searches", "hours",
            "recommendation_count", "subject_version", "subject_label", "subject", "body",
            "sent_at", "status", "message_id", "reply_label", "created_at", "updated_at",
        ]
        # TextField columns, which DRF maps to a CharField with no maximum.
        extra_kwargs = {
            "call_notes": {"max_length": bounds.FIELD_MAX["note"]},
            "excluded_reason": {"max_length": bounds.FIELD_MAX["note"]},
        }

    def get_subject(self, obj) -> str:
        return subject_for(obj)
