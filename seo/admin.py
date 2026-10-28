from django.contrib import admin

from .models import SeoProfile, SeoProspect, SeoSetupStep, SeoSubscriber


@admin.register(SeoSubscriber)
class SeoSubscriberAdmin(admin.ModelAdmin):
    list_display = (
        "business_name", "contact_name", "plan", "payment_status", "status", "created_at",
    )
    list_filter = ("plan", "payment_status", "status")
    search_fields = ("business_name", "contact_name", "email", "phone")
    readonly_fields = (
        "payment_status", "stripe_customer_id", "stripe_subscription_id",
        "subscription_current_period_end", "cancel_at_period_end",
        "created_at", "updated_at", "status_changed_at",
    )


@admin.register(SeoProfile)
class SeoProfileAdmin(admin.ModelAdmin):
    list_display = ("subscriber", "primary_location", "updated_at")
    search_fields = ("subscriber__business_name", "subscriber__email", "primary_location")
    readonly_fields = ("created_at", "updated_at")


@admin.register(SeoSetupStep)
class SeoSetupStepAdmin(admin.ModelAdmin):
    list_display = ("subscriber", "key", "state", "marked_done_at", "confirmed_at")
    list_filter = ("key", "state")
    search_fields = ("subscriber__business_name", "subscriber__email")
    readonly_fields = ("marked_done_at", "confirmed_at", "updated_at")


@admin.register(SeoProspect)
class SeoProspectAdmin(admin.ModelAdmin):
    list_display = ("business", "domain", "email", "subject_version", "sent_at", "called_at", "reply")
    list_filter = ("subject_version", "reply")
    search_fields = ("business", "domain", "email", "contact_name")
    readonly_fields = ("sent_at", "created_at", "updated_at")
