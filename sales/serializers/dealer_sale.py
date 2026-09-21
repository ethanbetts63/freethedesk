"""What a dealer reads and writes about their own sales.

Two serializers rather than one. The queue renders forty rows and needs six
fields; the sale page renders one row and needs every field on it, plus the
labels and the derived figures. Serving the list from the detail serializer
would send a licence number and a date of birth to a screen that does not
display them.

Nothing here resolves the dealer. Scoping is the view's job, through
``Sale.objects.for_dealer(request.user.dealer)`` — a serializer that filtered as
well would be a second place to get it right and a second place to forget.
"""

from freetheplatform.security import bounds
from rest_framework import serializers

from documents.api import document_rows
from identity.api import verification_for_sale, verification_payload
from documents.warranty import warranty_notice
from sales.models import Sale


def vehicle_summary(sale) -> str:
    """"2021 Honda CB125F" — what a dealer scans a queue by.

    Falls back to the condition alone rather than to an empty string: a draft
    with no make yet still has to render as something in a table cell.
    """
    parts = [str(sale.year) if sale.year else "", sale.make, sale.model_name]
    described = " ".join(part for part in parts if part)
    return described or sale.get_condition_display()


#: A sale is waiting on one of two parties, and which one is the only thing the
#: queue actually sorts by. Held here rather than computed from a chain of
#: conditionals so that a new status has to be given an answer.
WAITING_ON = {
    Sale.Status.DRAFT: ("dealer", "Finish it and send the link"),
    Sale.Status.AWAITING_CUSTOMER: ("customer", "Filling in their details"),
    Sale.Status.AWAITING_IDENTITY_REVIEW: ("dealer", "Approve or reject the images"),
    Sale.Status.READY_TO_SIGN: ("customer", "Reading and signing"),
    Sale.Status.SIGNED: ("dealer", "Approve and sign"),
    Sale.Status.ACCEPTED: ("customer", "Paying"),
    Sale.Status.AWAITING_PAYMENT: ("customer", "Paying"),
    Sale.Status.PAYMENT_CONFIRMED: ("dealer", "Lodge, hand over, mark complete"),
    Sale.Status.COMPLETED: ("nobody", "Complete"),
    Sale.Status.CANCELLED: ("nobody", "Cancelled"),
}

#: The statuses whose next move is the dealer's. The queue's default filter.
DEALER_ACTION_STATUSES = tuple(
    status for status, (party, _) in WAITING_ON.items() if party == "dealer"
)


class SaleListSerializer(serializers.ModelSerializer):
    """One row of the queue."""

    status_label = serializers.CharField(source="get_status_display", read_only=True)
    vehicle = serializers.SerializerMethodField()
    waiting_on = serializers.SerializerMethodField()
    waiting_for = serializers.SerializerMethodField()

    class Meta:
        model = Sale
        fields = [
            "reference", "customer_name", "vehicle", "status", "status_label",
            "waiting_on", "waiting_for", "vehicle_price", "created_at", "updated_at",
            "signed_at",
        ]
        read_only_fields = fields

    def get_vehicle(self, sale) -> str:
        return vehicle_summary(sale)

    def get_waiting_on(self, sale) -> str:
        return WAITING_ON[sale.status][0]

    def get_waiting_for(self, sale) -> str:
        return WAITING_ON[sale.status][1]


#: Everything the dealer may write, grouped as the create screen groups it.
#: Named rather than inferred from the model so that adding a column does not
#: silently make it writable from a request.
VEHICLE_FIELDS = [
    "vehicle_class", "condition", "make", "model_name", "year", "body_type",
    "colour", "vin", "engine_number", "engine_capacity_cc", "is_electric",
    "odometer_km", "registration", "registration_expiry",
    "registration_months_included", "stock_number", "rrp",
]

MONEY_FIELDS = ["vehicle_price", "delivery_fee", "deposit_amount"]

CUSTOMER_FIELDS = [
    "customer_name", "customer_email", "customer_phone", "fulfilment_method",
    "delivery_address_line1", "delivery_suburb", "delivery_state",
    "delivery_postcode",
]

#: What the customer normally supplies themselves. Writable by the dealer too,
#: because a dealer keying a sale for somebody standing in front of them has the
#: licence in their hand, and because a correction after signing is the dealer's
#: to make.
LICENSING_FIELDS = [
    "purchaser_is_licence_holder", "purchaser_family_name", "purchaser_given_names",
    "purchaser_address_line1", "purchaser_suburb", "purchaser_postcode",
    "licence_family_name", "licence_given_names", "licence_number",
    "licence_date_of_birth", "licensee_address_line1", "licensee_suburb",
    "licensee_postcode", "kept_primarily_in_wa", "licensed_to_company",
    "company_name", "company_acn", "company_organisation_code",
]

WRITABLE_FIELDS = VEHICLE_FIELDS + MONEY_FIELDS + CUSTOMER_FIELDS + LICENSING_FIELDS

READ_ONLY_FIELDS = [
    "reference", "status", "status_label", "produces", "produces_label",
    "source", "vehicle", "total_amount", "balance_amount",
    "waiting_on", "waiting_for", "documents", "warranty", "identity",
    "link_sent_at", "details_updated_at", "signed_at", "accepted_at",
    "acceptance_notified_at", "customer_marked_paid_at", "payment_confirmed_at",
    "completed_at", "cancelled_at", "cancellation_reason",
    "created_at", "updated_at",
]


class DealerSaleSerializer(serializers.ModelSerializer):
    """The whole sale, as the dealer's sale page shows it."""

    status_label = serializers.CharField(source="get_status_display", read_only=True)
    produces_label = serializers.CharField(source="get_produces_display", read_only=True)
    vehicle = serializers.SerializerMethodField()
    total_amount = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    waiting_on = serializers.SerializerMethodField()
    waiting_for = serializers.SerializerMethodField()
    documents = serializers.SerializerMethodField()
    warranty = serializers.SerializerMethodField()
    identity = serializers.SerializerMethodField()

    class Meta:
        model = Sale
        fields = READ_ONLY_FIELDS + WRITABLE_FIELDS
        read_only_fields = READ_ONLY_FIELDS
        extra_kwargs = {
            # Model `CharField`s carry their own `max_length`, which DRF
            # honours. The postcodes are bounded far wider by the column than by
            # reality, and `EmailField` is unbounded in DRF whatever the column
            # says — see the email entry below.
            "delivery_postcode": {"max_length": bounds.FIELD_MAX["postcode"]},
            "purchaser_postcode": {"max_length": bounds.FIELD_MAX["postcode"]},
            "licensee_postcode": {"max_length": bounds.FIELD_MAX["postcode"]},
            # Required on the model, but a draft is saved before the dealer has
            # necessarily typed any of them — the create screen is one form and
            # they may start with the vehicle.
            "customer_name": {"required": False, "allow_blank": True},
            "customer_email": {
                "required": False,
                "allow_blank": True,
                "max_length": bounds.FIELD_MAX["email"],
            },
            "condition": {"required": False},
        }

    def get_vehicle(self, sale) -> str:
        return vehicle_summary(sale)

    def get_waiting_on(self, sale) -> str:
        return WAITING_ON[sale.status][0]

    def get_waiting_for(self, sale) -> str:
        return WAITING_ON[sale.status][1]

    def get_documents(self, sale):
        """What this sale produces, and which of them are signed.

        The same rows the customer's own screen renders from. One source of
        truth, two audiences — building it twice is how a customer comes to be
        shown a document the dealer's page says does not exist.
        """
        return document_rows(sale)

    def get_warranty(self, sale):
        """The reg 7 verdict and whether the customer has acknowledged it.

        Derived on every read rather than stored, so an edit to a price, a year
        or an odometer reading moves the answer without anything having to
        remember to clear a flag.
        """
        return warranty_notice(sale)

    def get_identity(self, sale):
        """The three images and their verdicts.

        Read through `identity.api` rather than off the row, so that the day
        this becomes a Stripe verdict with no images behind it the shape stays
        the same and this screen does not have to know.
        """
        return verification_payload(verification_for_sale(sale))

    def create(self, validated_data):
        """Create through the tenant manager rather than the default one.

        DRF writes through ``_default_manager``, which on a tenant-owned model
        refuses every query — deliberately, per `core.models.tenancy`. The write
        site is the one place the dealer is never in doubt, so it says so.

        Pricing is applied before the insert rather than by a second save after
        it. ``balance_amount`` is the figure a customer is told to transfer, and
        it should never exist in the table without one.
        """
        dealer = validated_data.pop("dealer")
        validated_data["balance_amount"] = Sale(**validated_data).apply_pricing()
        return Sale.objects.create_for(dealer, **validated_data)

    def update(self, instance, validated_data):
        """Apply the edit and its derived figures in one write.

        ``ModelSerializer.update`` is reimplemented rather than called, because
        calling it means a save, then recomputing the balance, then a second
        save — two round trips and a window in which the row's price and its
        balance disagree. ``Sale`` has no relations DRF would have to handle
        here, so the loop below is the whole of what is being replaced.

        Fields the view passes to ``save()`` arrive in ``validated_data`` like
        any other, which is how ``details_updated_at`` gets set without a second
        statement of its own.
        """
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.apply_pricing()
        instance.save()
        return instance

    def validate(self, attrs):
        """Consistency, not completeness.

        A draft is deliberately allowed to be half-typed — the dealer keying a
        sale in a showroom saves and comes back — so nothing here requires a
        field. What it does refuse is a combination that could not be true at
        once, because those are the ones that print a wrong document rather than
        an incomplete one: an odometer reading on a vehicle that has never been
        licensed, an engine capacity on an electric bike, a delivery address on
        a collection.

        Completeness is the send endpoint's job, and it is checked there against
        the whole sale rather than against one request's fields.
        """
        def value(name):
            return attrs[name] if name in attrs else getattr(self.instance, name, None)

        errors = {}
        condition = value("condition")
        if condition == Sale.Condition.NEW:
            if value("odometer_km"):
                errors["odometer_km"] = [
                    "New stock has no odometer reading to state."
                ]
            if value("registration_expiry"):
                errors["registration_expiry"] = [
                    "New stock is not licensed yet. Give the registration term "
                    "included in the price instead."
                ]
        elif condition:
            if value("registration_months_included"):
                errors["registration_months_included"] = [
                    "Used stock carries the registration already on it. State "
                    "its expiry date instead."
                ]

        if value("is_electric") and value("engine_capacity_cc"):
            errors["engine_capacity_cc"] = ["An electric vehicle has no engine capacity."]

        if value("fulfilment_method") == Sale.Fulfilment.PICKUP:
            for field in ("delivery_address_line1", "delivery_suburb", "delivery_postcode"):
                if value(field):
                    errors[field] = ["This sale is a collection, not a delivery."]

        if value("licensed_to_company") is False:
            for field in ("company_name", "company_acn", "company_organisation_code"):
                if value(field):
                    errors[field] = ["This vehicle is not being licensed to a company."]

        if value("purchaser_is_licence_holder") is True:
            for field in ("purchaser_family_name", "purchaser_given_names"):
                if value(field):
                    errors[field] = [
                        "The purchaser is the licence holder, so their details are "
                        "the licence holder's."
                    ]

        if errors:
            raise serializers.ValidationError(errors)
        return attrs
