"""What the customer sees, and what they may write.

Two serializers, and the split is an access-control decision rather than a
presentational one. The overview is everything a customer is entitled to know
about their own sale; the details serializer is the much smaller set they are
entitled to change. Serving one from the other would make a stock number
writable because it happened to be displayed.

The dealer's own fields — their bank details, their notes, the audit trail —
are not in either.
"""

from freetheplatform.security import bounds
from rest_framework import serializers

from documents.api import document_rows
from documents.warranty import warranty_notice
from identity.api import verification_for_sale, verification_payload
from sales.models import Sale
from sales.requirements import customer_requirements, details_are_editable

#: What the customer supplies. Named rather than inferred, so that adding a
#: column to `Sale` never silently makes it writable by a member of the public.
CUSTOMER_WRITABLE = [
    "purchaser_is_licence_holder",
    "purchaser_family_name", "purchaser_given_names",
    "purchaser_address_line1", "purchaser_suburb", "purchaser_postcode",
    "licence_family_name", "licence_given_names", "licence_number",
    "licence_date_of_birth", "licensee_address_line1", "licensee_suburb",
    "licensee_postcode", "kept_primarily_in_wa",
    "licensed_to_company", "company_name", "company_acn",
    "company_organisation_code",
    "delivery_address_line1", "delivery_suburb", "delivery_postcode",
    "customer_phone",
]

POSTCODE = r"^\d{4}$"


class CustomerSaleDetailsSerializer(serializers.ModelSerializer):
    """The Fill step.

    Every string is bounded, per section 9 of the security standard. This is the
    one place in FreeTheDesk where an anonymous member of the public writes to
    the database repeatedly over weeks, so the ceilings are the control and the
    browser copy exists only to tell them at the point of typing.
    """

    class Meta:
        model = Sale
        fields = CUSTOMER_WRITABLE
        extra_kwargs = {
            "customer_phone": {"max_length": bounds.FIELD_MAX["phone"]},
            # An anchored regex is already a bound — a WA postcode is four
            # digits and needs nothing else.
            "purchaser_postcode": {"max_length": bounds.FIELD_MAX["postcode"]},
            "licensee_postcode": {"max_length": bounds.FIELD_MAX["postcode"]},
            "delivery_postcode": {"max_length": bounds.FIELD_MAX["postcode"]},
        }

    def validate_licensee_postcode(self, value):
        return _postcode(value)

    def validate_purchaser_postcode(self, value):
        return _postcode(value)

    def validate_delivery_postcode(self, value):
        return _postcode(value)

    def validate(self, attrs):
        """The three conditional groups, checked as groups.

        Half a company is worse than none: a form carrying a company name and no
        ACN produces a licensing application the Department will reject, and the
        customer finds out from the dealer weeks later.
        """
        def value(name):
            return attrs[name] if name in attrs else getattr(self.instance, name)

        errors = {}
        if value("licensed_to_company"):
            for field, label in (
                ("company_name", "the company's name"),
                ("company_acn", "the company's ACN"),
            ):
                if not value(field):
                    errors[field] = [f"Give {label} to license this vehicle to a company."]
        if not value("purchaser_is_licence_holder"):
            for field, label in (
                ("purchaser_family_name", "your family name"),
                ("purchaser_given_names", "your given names"),
                ("purchaser_address_line1", "your street address"),
                ("purchaser_suburb", "your suburb"),
                ("purchaser_postcode", "your postcode"),
            ):
                if not value(field):
                    errors[field] = [f"Give {label}, as the person buying the vehicle."]
        if errors:
            raise serializers.ValidationError(errors)
        return attrs


def _postcode(value):
    import re

    value = value.strip()
    if value and not re.match(POSTCODE, value):
        raise serializers.ValidationError("An Australian postcode is four digits.")
    return value


class CustomerSaleSerializer(serializers.ModelSerializer):
    """Everything the customer is entitled to see about their own sale."""

    status_label = serializers.CharField(source="get_status_display", read_only=True)
    dealer_name = serializers.CharField(source="dealer.business_name", read_only=True)
    dealer_email = serializers.EmailField(source="dealer.user.email", read_only=True)
    dealer_phone = serializers.CharField(source="dealer.phone", read_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    requirements = serializers.SerializerMethodField()
    documents = serializers.SerializerMethodField()
    warranty = serializers.SerializerMethodField()
    identity = serializers.SerializerMethodField()
    details_editable = serializers.SerializerMethodField()

    class Meta:
        model = Sale
        fields = [
            "reference", "status", "status_label",
            "dealer_name", "dealer_email", "dealer_phone",
            "vehicle_class", "condition", "make", "model_name", "year",
            "body_type", "colour", "vin", "engine_number", "engine_capacity_cc",
            "is_electric", "odometer_km", "registration", "registration_expiry",
            "registration_months_included",
            "vehicle_price", "delivery_fee", "deposit_amount", "balance_amount",
            "total_amount",
            "fulfilment_method", "delivery_address_line1", "delivery_suburb",
            "delivery_state", "delivery_postcode",
            "customer_name", "customer_email", "customer_phone",
            "purchaser_is_licence_holder", "purchaser_family_name",
            "purchaser_given_names", "purchaser_address_line1",
            "purchaser_suburb", "purchaser_postcode",
            "licence_family_name", "licence_given_names", "licence_number",
            "licence_date_of_birth", "licensee_address_line1", "licensee_suburb",
            "licensee_postcode", "kept_primarily_in_wa",
            "licensed_to_company", "company_name", "company_acn",
            "company_organisation_code",
            "signed_at", "accepted_at", "customer_marked_paid_at",
            "payment_confirmed_at", "completed_at",
            "requirements", "documents", "warranty", "identity", "details_editable",
        ]
        read_only_fields = fields

    def _derived(self, sale) -> dict:
        """The three derivations this response needs, computed once.

        Four of the fields below are made of the same two things — the document
        list and the warranty verdict — and each one used to derive them for
        itself. That put the document query through three times per response,
        which is a fixed multiplier on the busiest customer-facing endpoint.

        Cached against the sale's own pk rather than a bare flag: a serializer
        instance is reused across a list, and a cache that cannot tell which row
        it belongs to renders the first sale's checklist onto all of them.
        """
        if getattr(self, "_derived_for", None) != sale.pk:
            documents = document_rows(sale)
            warranty = warranty_notice(sale)
            self._derived_cache = {
                "documents": documents,
                "warranty": warranty,
                "requirements": customer_requirements(
                    sale, documents=documents, warranty=warranty
                ),
            }
            self._derived_for = sale.pk
        return self._derived_cache

    def get_requirements(self, sale):
        return self._derived(sale)["requirements"]

    def get_documents(self, sale):
        return self._derived(sale)["documents"]

    def get_warranty(self, sale):
        return self._derived(sale)["warranty"]

    def get_identity(self, sale):
        return verification_payload(verification_for_sale(sale))

    def get_details_editable(self, sale) -> bool:
        return details_are_editable(sale, requirements=self._derived(sale)["requirements"])
