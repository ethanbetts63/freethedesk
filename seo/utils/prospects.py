"""Reading what became of a prospect report email, for the calls list."""

from django.contrib.contenttypes.models import ContentType
from django.db.models import Case, CharField, OuterRef, Q, Subquery, Value, When
from freetheplatform.messaging import Message

from ..models import SeoProspect

# Statuses a prospect can show on the dashboard, composed from the row and the
# message log. The message statuses are messaging's own words.
STATUSES = ["queued", "sent", "delivered", "failed", "bounced", "suppressed", "excluded"]


def with_status(queryset):
    """Annotate ``message_status`` (the latest email's), ``message_sent_at`` and the composed ``status``."""
    content_type = ContentType.objects.get_for_model(SeoProspect)
    latest = Message.objects.filter(
        content_type=content_type,
        object_id=OuterRef("pk"),
        message_type__startswith="seo_prospect.",
    ).order_by("-created_at")
    return queryset.annotate(
        message_status=Subquery(latest.values("status")[:1], output_field=CharField()),
        message_id=Subquery(latest.values("id")[:1]),
    ).annotate(
        status=Case(
            When(~Q(excluded_reason=""), then=Value("excluded")),
            When(sent_at__isnull=True, then=Value("queued")),
            When(message_status__isnull=True, then=Value("queued")),
            default="message_status",
            output_field=CharField(),
        )
    )
