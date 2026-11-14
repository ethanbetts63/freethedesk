"""Reading what became of a prospect report email, for the calls list."""

from django.contrib.contenttypes.models import ContentType
from django.db.models import Case, CharField, Count, F, Max, OuterRef, Q, Subquery, Value, When
from freetheplatform.messaging import Message

from ..models import SeoProspect, SeoProspectOpen


def with_status(queryset):
    """Annotate ``message_status`` (the latest email's), ``message_id``, the composed ``status``, and the link's
    ``open_count`` by people (previews and crawlers left out) with ``last_opened_at``, and ``seo_click_count``.
    Only what came after the email went (``sent_at``) counts: a look before it is the owner checking the page or
    a preview, and a report not yet sent has none (owner, 2026-11-14).

    ``status`` is ``held`` (uploaded for its link, waiting for the owner's approval), ``queued`` (approved, waiting
    for the hourly send), ``excluded``, or the latest email's own status in the message log."""
    content_type = ContentType.objects.get_for_model(SeoProspect)
    latest = Message.objects.filter(
        content_type=content_type,
        object_id=OuterRef("pk"),
        message_type__startswith="seo_prospect.",
    ).order_by("-created_at")
    people = Q(opens__likely_bot=False, opens__opened_at__gte=F("sent_at"))
    # A click on to the SEO page is logged beside the opens but is not one.
    opened = people & Q(opens__kind__in=(SeoProspectOpen.Kind.PAGE, SeoProspectOpen.Kind.PDF))
    clicked = people & Q(opens__kind=SeoProspectOpen.Kind.SEO)
    return queryset.annotate(
        message_status=Subquery(latest.values("status")[:1], output_field=CharField()),
        message_id=Subquery(latest.values("id")[:1]),
        open_count=Count("opens", filter=opened, distinct=True),
        last_opened_at=Max("opens__opened_at", filter=opened),
        seo_click_count=Count("opens", filter=clicked, distinct=True),
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
