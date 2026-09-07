from django.contrib import admin

from .models import Enquiry, Notification, SiteSettings


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = (
        "licensing_price", "contracts_price", "complete_price",
        "seo_quarterly_price", "gbp_audit_price", "ai_readiness_audit_price",
        "updated_at",
    )
    readonly_fields = ("updated_at",)

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ("business", "name", "help_with", "status", "email", "created_at")
    list_filter = ("status", "help_with", "created_at")
    search_fields = ("business", "name", "email", "message")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("recipient", "channel", "subject", "status", "sent_at", "created_at")
    list_filter = ("channel", "status", "recipient_type")
    search_fields = ("recipient", "subject", "body")
    readonly_fields = ("created_at", "sent_at")
