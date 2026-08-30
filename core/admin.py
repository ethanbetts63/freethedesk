from django.contrib import admin

from .models import Enquiry, Notification


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
