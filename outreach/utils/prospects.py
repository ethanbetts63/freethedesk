"""Taking uploaded entries into the prospect table, and reading what became of them."""

from django.contrib.contenttypes.models import ContentType
from django.db import IntegrityError, transaction
from django.db.models import Case, CharField, OuterRef, Q, Subquery, Value, When
from freetheplatform.messaging import Message, is_suppressed

from ..models import PodcastProspect
from .names import first_name
from .pitching import next_version

# Statuses a prospect can show on the dashboard, composed from the row and the
# message log. The message statuses are messaging's own words.
STATUSES = ["queued", "sent", "delivered", "failed", "bounced", "suppressed", "signed_up", "excluded"]


def create_prospect(entry: dict) -> tuple[str, PodcastProspect | None]:
    """One uploaded entry: ``(outcome, prospect)``.

    Outcomes: ``created``, ``already_known`` (a prospect with this address
    exists), ``suppressed`` (messaging would never deliver to it, so there is
    no point holding it).
    """
    email = entry["email"].strip().lower()
    if PodcastProspect.objects.filter(email=email).exists():
        return "already_known", None
    if is_suppressed(email):
        return "suppressed", None
    try:
        with transaction.atomic():
            prospect = PodcastProspect.objects.create(
                **{**entry, "email": email},
                first_name=first_name(entry.get("host_name", "")),
                version=next_version(),
            )
    except IntegrityError:
        # Two uploads of the same address in one batch; the first one won.
        return "already_known", None
    return "created", prospect


def with_status(queryset):
    """Annotate ``message_status`` (the latest pitch's) and the composed ``status``."""
    content_type = ContentType.objects.get_for_model(PodcastProspect)
    latest = (
        Message.objects.filter(
            content_type=content_type,
            object_id=OuterRef("pk"),
            message_type__startswith="podcast_pitch.",
        )
        .order_by("-created_at")
        .values("status")[:1]
    )
    return queryset.annotate(
        message_status=Subquery(latest, output_field=CharField()),
    ).annotate(
        status=Case(
            When(~Q(excluded_reason=""), then=Value("excluded")),
            When(affiliate__isnull=False, then=Value("signed_up")),
            When(pitched_at__isnull=True, then=Value("queued")),
            When(message_status__isnull=True, then=Value("queued")),
            default="message_status",
            output_field=CharField(),
        )
    )
