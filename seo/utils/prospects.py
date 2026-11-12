"""Reading what became of a prospect report email, for the calls list."""

from django.contrib.contenttypes.models import ContentType
from django.db.models import Case, CharField, Count, Max, OuterRef, Q, Subquery, Value, When
from freetheplatform.messaging import Message

from ..models import SeoProspect


def with_status(queryset):
    """Annotate ``message_status`` (the latest email's), ``message_id``, the composed ``status``, and the link's
    ``open_count`` by people (previews and crawlers left out) with ``last_opened_at``.

    ``status`` is ``held`` (uploaded for its link, waiting for the owner's approval), ``queued`` (approved, waiting
    for the hourly send), ``excluded``, or the latest email's own status in the message log."""
    content_type = ContentType.objects.get_for_model(SeoProspect)
    latest = Message.objects.filter(
        content_type=content_type,
        object_id=OuterRef("pk"),
        message_type__startswith="seo_prospect.",
    ).order_by("-created_at")
    people = Q(opens__likely_bot=False)
    return queryset.annotate(
        message_status=Subquery(latest.values("status")[:1], output_field=CharField()),
        message_id=Subquery(latest.values("id")[:1]),
        open_count=Count("opens", filter=people, distinct=True),
        last_opened_at=Max("opens__opened_at", filter=people),
    ).annotate(
        status=Case(
            When(~Q(excluded_reason=""), then=Value("excluded")),
            When(approved_at__isnull=True, then=Value("held")),
            When(sent_at__isnull=True, then=Value("queued")),
            When(message_status__isnull=True, then=Value("queued")),
            default="message_status",
            output_field=CharField(),
        )
    )
