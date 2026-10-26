from freetheplatform.security import bounds
from rest_framework import serializers

from ..models import PodcastProspect

# Entries a request may carry. Fifty descriptions at 1,500 characters is well
# inside DATA_UPLOAD_MAX_MEMORY_SIZE, and the local command chunks to match.
MAX_BATCH = 50

# Feed and listing URLs run past the 200-character `url` kind; the columns are
# 500 wide and so is the bound, the same number on both ends.
URL_MAX = PodcastProspect._meta.get_field("email_source").max_length


def _url(**kwargs):
    return serializers.URLField(max_length=URL_MAX, **kwargs)


class ProspectEntrySerializer(serializers.Serializer):
    """One line of the local queue, as `scrape_podcasts` writes it."""

    email = bounds.email()
    email_source = _url()
    podcast_name = bounds.char("line")
    host_name = bounds.char("line", required=False, allow_blank=True, default="")
    website = _url(required=False, allow_blank=True, default="")
    apple_url = _url(required=False, allow_blank=True, default="")
    genre = bounds.char("line", required=False, allow_blank=True, default="")
    episode_count = serializers.IntegerField(min_value=0, required=False, default=0)
    latest_episode_title = bounds.char("line", required=False, allow_blank=True, default="")
    latest_episode_description = bounds.text("note", required=False, allow_blank=True, default="")
    last_release_date = serializers.DateField(required=False, allow_null=True, default=None)
    opener = bounds.text("note", required=False, allow_blank=True, default="")
    relevance = serializers.ChoiceField(
        choices=PodcastProspect.Relevance.choices, required=False, allow_blank=True, default=""
    )
    scraped_on = serializers.DateField()


class UploadSerializer(serializers.Serializer):
    """The request body: a list of entries. Each is validated on its own, so one
    bad line is reported rather than failing the batch (see the view)."""

    entries = serializers.ListField(child=serializers.DictField(), min_length=1, max_length=MAX_BATCH)
