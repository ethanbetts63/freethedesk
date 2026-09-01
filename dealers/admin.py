from django.contrib import admin

from .models import Dealer


@admin.register(Dealer)
class DealerAdmin(admin.ModelAdmin):
    list_display = ("business_name", "contact_name", "email", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("business_name", "contact_name", "email", "phone")
    readonly_fields = ("created_at", "updated_at", "status_changed_at")
