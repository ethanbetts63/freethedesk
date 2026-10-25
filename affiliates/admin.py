from django.contrib import admin

from .models import Affiliate, Commission


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
