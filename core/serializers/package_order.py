from urllib.parse import urlsplit

from freetheplatform.security import bounds
from rest_framework import serializers

from ..models import PackageOrder
from ..utils.package_pricing import quote_package


class PackageOrderSerializer(serializers.Serializer):
    """The order form on a service page: the free enquiry's fields, the package, and the terms.

    The price and the share due now come from the admin's settings, never from the browser. The
    terms are agreed to here and recorded by the view, so checkout has an acceptance to charge
    against.
    """

    package = serializers.ChoiceField(choices=PackageOrder.Package.choices)
    # Optional: the people most likely to want a first website have none to give.
    website = bounds.url(required=False, allow_blank=True, default="")
    email = bounds.email()
    phone = bounds.char("phone", required=False, allow_blank=True, default="")
    notes = bounds.text("note", required=False, allow_blank=True, default="")
    accepted_terms = serializers.BooleanField()

    def validate_accepted_terms(self, value: bool) -> bool:
        if not value:
            raise serializers.ValidationError("Accept the Web Development Terms to continue.")
        return value

    def validate_email(self, value: str) -> str:
        return value.strip().lower()

    def create(self, validated_data):
        quote = quote_package(validated_data["package"])
        email = validated_data["email"]
        hostname = urlsplit(validated_data["website"]).hostname or email.partition("@")[2]
        return PackageOrder.objects.create(
            package=quote.package,
            package_name=quote.name,
            price=quote.price,
            due_now=quote.due_now,
            email=email,
            phone=validated_data["phone"],
            website=validated_data["website"],
            business_name=hostname.removeprefix("www."),
            notes=validated_data["notes"].strip(),
        )


class PackageOrderStatusSerializer(serializers.ModelSerializer):
    """What the payment and confirmation pages may know about an order, by its reference alone:
    what was bought and whether it is paid, and nothing that identifies the buyer."""

    paid = serializers.BooleanField(source="has_paid", read_only=True)

    class Meta:
        model = PackageOrder
        fields = ["package", "package_name", "price", "due_now", "paid"]
        read_only_fields = fields


class AdminPackageOrderSerializer(serializers.ModelSerializer):
    package_label = serializers.CharField(source="get_package_display", read_only=True)
    payment_status_label = serializers.CharField(
        source="get_payment_status_display", read_only=True
    )
    balance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = PackageOrder
        fields = [
            "id", "package", "package_label", "package_name", "price", "due_now", "balance",
            "email", "phone", "website", "business_name", "notes", "payment_status",
            "payment_status_label", "paid_at", "created_at", "updated_at",
        ]
        read_only_fields = fields
