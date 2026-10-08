from django.contrib import admin

from .models import Enquiry, PackageOrder, SiteSettings


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = (
        "licensing_price", "contracts_price", "complete_price",
        "seo_monthly_price", "seo_quarterly_price", "seo_yearly_price", "seo_oneoff_price",
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


@admin.register(PackageOrder)
class PackageOrderAdmin(admin.ModelAdmin):
    list_display = ("package_name", "business_name", "email", "price", "payment_status", "created_at")
    list_filter = ("payment_status", "package", "created_at")
    search_fields = ("business_name", "email", "phone", "website", "notes")
    readonly_fields = ("checkout_reference", "price", "due_now", "paid_at", "created_at", "updated_at")
