from rest_framework import serializers, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from affiliates.utils.permissions import IsInternalApiRequest

from ..models import SeoSampleReport
from ..utils.sample_links import sample_link

#: A report page is one self-contained HTML file, its screenshots inline; a few MB each.
MAX_REPORT_BYTES = 25 * 1024 * 1024


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
    details replaced and keeps its link, so a link already sent stays good. Nothing is emailed. Answers the link.
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
        sample.business = data["business"]
        sample.domain = data.get("domain", "")
        sample.demo_url = data["demo_url"]
        old = sample.report_html.name if sample.report_html else ""
        sample.report_html.save(f"sample_{data['project']}.html", data["report_html"], save=False)
        sample.save()
        if old and old != sample.report_html.name:
            sample.report_html.storage.delete(old)
        return Response(
            {"outcome": "created" if created else "replaced", "link": sample_link(sample)},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )
