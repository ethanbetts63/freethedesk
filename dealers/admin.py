from django.contrib import admin

from .models import Dealer, DealerProfile


@admin.register(Dealer)
class DealerAdmin(admin.ModelAdmin):
    list_display = (
        "business_name", "contact_name", "state", "plan", "payment_status", "status", "created_at",
    )
    list_filter = ("state", "plan", "payment_status", "status")
    search_fields = ("business_name", "contact_name", "email", "phone")
    readonly_fields = ("created_at", "updated_at", "status_changed_at")


@admin.register(DealerProfile)
class DealerProfileAdmin(admin.ModelAdmin):
    list_display = ("dealer", "verification_status", "dealer_licence_number", "updated_at")
    list_filter = ("verification_status",)
    search_fields = (
        "dealer__business_name", "trading_name", "dealer_licence_number", "abn", "email",
    )
    readonly_fields = ("created_at", "updated_at", "submitted_at", "reviewed_at")
