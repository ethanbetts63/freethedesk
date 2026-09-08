from django.contrib import admin

from .models import SeoProfile, SeoSubscriber


@admin.register(SeoSubscriber)
class SeoSubscriberAdmin(admin.ModelAdmin):
    list_display = (
        "business_name", "contact_name", "plan", "payment_status", "status", "created_at",
    )
    list_filter = ("plan", "payment_status", "status")
    search_fields = ("business_name", "contact_name", "user__email", "phone")
    readonly_fields = (
        "payment_status", "stripe_customer_id", "stripe_subscription_id",
        "stripe_checkout_session_id", "stripe_payment_intent_id", "stripe_last_event_created_at",
        "subscription_current_period_end", "cancel_at_period_end",
        "created_at", "updated_at", "status_changed_at",
    )


@admin.register(SeoProfile)
class SeoProfileAdmin(admin.ModelAdmin):
    list_display = ("subscriber", "onboarding_status", "primary_location", "updated_at")
    list_filter = ("onboarding_status",)
    search_fields = ("subscriber__business_name", "subscriber__user__email", "primary_location")
    readonly_fields = ("created_at", "updated_at", "submitted_at")
