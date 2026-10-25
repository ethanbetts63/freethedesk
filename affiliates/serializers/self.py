from decimal import Decimal

from rest_framework import serializers

from core.models import SiteSettings
from core.utils.urls import site_url

from ..models import Affiliate, Commission
from .commission import CommissionSerializer

#: Where a listener lands with the code already filled in.
SHARE_PATH = "/seo"


def share_link(code: str) -> str:
    return f"{site_url()}{SHARE_PATH}?code={code}" if code else f"{site_url()}{SHARE_PATH}"


def earnings(affiliate: Affiliate) -> dict:
    """What the affiliate has earned, by where it stands."""
    totals = {status: Decimal("0.00") for status in Commission.Status.values}
    sales = 0
    for commission in affiliate.commissions.all():
        totals[commission.status] += commission.amount
        if commission.status != Commission.Status.VOID:
            sales += 1
    return {
        "sales": sales,
        "owed": str(totals[Commission.Status.OWED]),
        "paid": str(totals[Commission.Status.PAID]),
    }


class AffiliateSelfSerializer(serializers.ModelSerializer):
    """What an affiliate may see and change about their own account.

    Email is read-only: it is the login identity. The code is read-only too; it
    was made from the podcast's name at sign-up and listeners already have it.
    """

    status_label = serializers.CharField(source="get_status_display", read_only=True)
    code = serializers.CharField(read_only=True)
    discount_percent = serializers.SerializerMethodField()
    share_percent = serializers.SerializerMethodField()
    share_link = serializers.SerializerMethodField()
    earnings = serializers.SerializerMethodField()
    commissions = CommissionSerializer(many=True, read_only=True)

    class Meta:
        model = Affiliate
        fields = [
            "id", "business_name", "contact_name", "email", "website",
            "status", "status_label", "code", "discount_percent", "share_percent",
            "share_link", "earnings", "commissions", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "email", "status", "status_label", "code", "discount_percent",
            "share_percent", "share_link", "earnings", "commissions", "created_at", "updated_at",
        ]

    def get_discount_percent(self, obj) -> int:
        # The code's own percentage, which is what the listener gets: the site
        # setting may have moved since the code was made.
        if obj.discount is not None and obj.discount.percentage is not None:
            return int(obj.discount.percentage)
        return SiteSettings.load().affiliate_discount_percent

    def get_share_percent(self, obj) -> int:
        return SiteSettings.load().affiliate_share_percent

    def get_share_link(self, obj) -> str:
        return share_link(obj.code)

    def get_earnings(self, obj) -> dict:
        return earnings(obj)
