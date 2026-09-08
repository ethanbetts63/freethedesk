import mimetypes
from pathlib import Path

from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db.models import Q
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Enquiry, Notification
from ..serializers import AdminNotificationSerializer
from ..utils.notifications import send_manual_email
from ..utils.ordering import apply_ordering
from ..utils.pagination import DashboardPagination

MESSAGE_ORDERING = {
    "recipient": ("recipient",),
    "subject": ("subject",),
    "channel": ("channel",),
    "status": ("status",),
    "sent_at": ("sent_at",),
    "created_at": ("created_at",),
}


class AdminNotificationListView(ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminNotificationSerializer
    pagination_class = DashboardPagination

    def get_queryset(self):
        params = self.request.query_params
        queryset = Notification.objects.select_related("related_enquiry", "related_dealer", "related_seo_subscriber")
        related_enquiry = params.get("related_enquiry", "").strip()
        if related_enquiry.isdigit():
            queryset = queryset.filter(related_enquiry_id=int(related_enquiry))
        related_dealer = params.get("related_dealer", "").strip()
        if related_dealer.isdigit():
            queryset = queryset.filter(related_dealer_id=int(related_dealer))
        related_seo_subscriber = params.get("related_seo_subscriber", "").strip()
        if related_seo_subscriber.isdigit():
            queryset = queryset.filter(related_seo_subscriber_id=int(related_seo_subscriber))
        for field in ("status", "channel", "recipient_type"):
            value = params.get(field, "").strip()
            if value:
                queryset = queryset.filter(**{f"{field}__in": [part.strip() for part in value.split(",") if part.strip()]})
        search = params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(subject__icontains=search)
                | Q(body__icontains=search)
                | Q(recipient__icontains=search)
                | Q(related_enquiry__business__icontains=search)
            )
        return apply_ordering(queryset, params, MESSAGE_ORDERING)


class AdminNotificationDetailView(RetrieveAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminNotificationSerializer
    queryset = Notification.objects.select_related("related_enquiry", "related_dealer", "related_seo_subscriber")


class AdminComposeMessageView(APIView):
    permission_classes = [IsAdminUser]

    MAX_ATTACHMENTS = 10
    MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024
    MAX_TOTAL_ATTACHMENT_SIZE = 24 * 1024 * 1024

    def post(self, request):
        to = (request.data.get("to") or "").strip()
        try:
            validate_email(to)
        except ValidationError:
            return Response({"to": ["Enter a valid email address."]}, status=status.HTTP_400_BAD_REQUEST)
        subject = (request.data.get("subject") or "").strip()
        body = (request.data.get("body") or "").strip()
        if not subject or not body:
            return Response({"detail": "Subject and email body are required."}, status=status.HTTP_400_BAD_REQUEST)

        uploads = request.FILES.getlist("attachments")
        if len(uploads) > self.MAX_ATTACHMENTS:
            return Response({"attachments": ["Attach no more than 10 files."]}, status=status.HTTP_400_BAD_REQUEST)
        total_size = sum(upload.size for upload in uploads)
        if any(upload.size > self.MAX_ATTACHMENT_SIZE for upload in uploads) or total_size > self.MAX_TOTAL_ATTACHMENT_SIZE:
            return Response({"attachments": ["Attachments must be at most 20 MB each and 24 MB in total."]}, status=status.HTTP_400_BAD_REQUEST)
        attachments = [
            (
                Path(upload.name).name or "attachment",
                upload.read(),
                upload.content_type or mimetypes.guess_type(upload.name)[0] or "application/octet-stream",
            )
            for upload in uploads
        ]
        related_enquiry = None
        related_enquiry_id = (request.data.get("related_enquiry") or "").strip()
        if related_enquiry_id:
            related_enquiry = Enquiry.objects.filter(pk=related_enquiry_id).first()
            if related_enquiry is None:
                return Response({"detail": "Related enquiry was not found."}, status=status.HTTP_400_BAD_REQUEST)
        notification = send_manual_email(
            to=to,
            subject=subject,
            body=body,
            related_enquiry=related_enquiry,
            attachments=attachments,
        )
        if notification.status != Notification.Status.SENT:
            return Response(
                {"detail": "Email could not be sent. The attempt was recorded in Messages."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response({"detail": f"Email sent to {to}."})
