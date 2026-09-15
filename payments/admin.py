from django.contrib import admin

from .models import StripeEvent


@admin.register(StripeEvent)
class StripeEventAdmin(admin.ModelAdmin):
    list_display = ("event_type", "event_id", "object_id", "outcome", "stripe_created_at", "processed_at")
    list_filter = ("event_type", "outcome")
    search_fields = ("event_id", "object_id")
    readonly_fields = ("event_id", "event_type", "object_id", "stripe_created_at", "outcome", "processed_at")

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
