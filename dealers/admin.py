from django.contrib import admin

from .models import Dealer, DealerProfile


@admin.register(Dealer)
class DealerAdmin(admin.ModelAdmin):
    list_display = (
        "business_name", "contact_name", "state", "plan", "payment_status", "status", "created_at",
    )
    list_filter = ("state", "plan", "payment_status", "status")
    search_fields = ("business_name", "contact_name", "email", "phone")
    readonly_fields = (
        "payment_status", "stripe_customer_id", "stripe_subscription_id",
        "stripe_checkout_session_id", "stripe_last_event_created_at",
        "subscription_current_period_end", "cancel_at_period_end",
        "created_at", "updated_at", "status_changed_at",
    )


@admin.register(DealerProfile)
class DealerProfileAdmin(admin.ModelAdmin):
    list_display = ("dealer", "verification_status", "dealer_licence_number", "updated_at")
    list_filter = ("verification_status",)
    search_fields = (
        "dealer__business_name", "dealer__email", "dealer_licence_number", "abn",
    )
    readonly_fields = ("created_at", "updated_at", "submitted_at", "reviewed_at")
