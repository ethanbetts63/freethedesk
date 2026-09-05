from django.contrib import admin

from .models import DealerSubscriptionTermsAcceptance, StripeEvent


@admin.register(DealerSubscriptionTermsAcceptance)
class DealerSubscriptionTermsAcceptanceAdmin(admin.ModelAdmin):
    list_display = ("dealer", "plan", "monthly_price", "currency", "terms_version", "accepted_at")
    list_filter = ("plan", "currency", "terms_version")
    search_fields = ("dealer__business_name", "dealer__email", "stripe_checkout_session_id")
    readonly_fields = (
        "dealer", "accepted_by", "plan", "monthly_price", "currency", "terms_version",
        "terms_sha256", "accepted_ip", "accepted_at", "stripe_checkout_session_id",
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


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
