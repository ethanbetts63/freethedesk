from django.contrib import admin

from .models import Affiliate, Commission, PodcastProspect


@admin.register(Affiliate)
class AffiliateAdmin(admin.ModelAdmin):
    list_display = ("business_name", "contact_name", "email", "code", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("business_name", "contact_name", "email", "discount__code")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Commission)
class CommissionAdmin(admin.ModelAdmin):
    list_display = ("affiliate", "description", "sale_amount", "amount", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("affiliate__business_name", "affiliate__email", "description")
    readonly_fields = ("payment", "sale_amount", "amount", "currency", "created_at", "updated_at")


@admin.register(PodcastProspect)
class PodcastProspectAdmin(admin.ModelAdmin):
    list_display = ("podcast_name", "host_name", "email", "version", "pitched_at", "reply", "affiliate")
    list_filter = ("version", "reply", "scraped_on")
    search_fields = ("podcast_name", "host_name", "email")
    readonly_fields = ("pitched_at", "created_at", "updated_at")
