from django.contrib import admin

from .models import PodcastProspect


@admin.register(PodcastProspect)
class PodcastProspectAdmin(admin.ModelAdmin):
    list_display = ("podcast_name", "host_name", "email", "version", "pitched_at", "reply", "affiliate")
    list_filter = ("version", "reply", "scraped_on")
    search_fields = ("podcast_name", "host_name", "email")
    readonly_fields = ("pitched_at", "created_at", "updated_at")
