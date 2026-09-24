"""The sale aggregate.

One row carries the whole of a sale: the vehicle, the customer, the money, the
gates and the state. Splitting it into separate customer and vehicle tables
would buy normalisation nobody needs — a customer exists only within one sale
and is deliberately not reused across dealers, and the vehicle is a snapshot by
design — and would cost joins on every screen in the product.

See `_docs/licensing/plan/03-data-model.md` for the field-by-field reasoning and
`02-sale-flow.md` for the flow the status field walks through.
"""

import secrets

from django.db import models

from core.models import TenantOwned


def generate_reference():
    """A free ``S-`` reference.

    The retry matters rather than being belt-and-braces: collisions follow the
    birthday bound, not the per-pair odds. Ten hex characters is a 2**40 space,
    chosen deliberately wider than allbikes' eight — its own comment records
    that eight gives roughly a 1.2% chance of a collision across 10,000 orders,
    and a product serving many dealers starts on the far side of that rather
    than waiting to print two customers the same reference.

    ``unique=True`` on the column is still what guarantees it. This check races,
    and the loser gets an IntegrityError rather than a duplicate, which is the
    correct failure.

    Uses ``all_objects`` because ``objects`` refuses an unscoped query, and
    uniqueness is a property of the whole table rather than of one dealer.
    """
    while True:
        reference = f"S-{secrets.token_hex(5).upper()}"
        if not Sale.all_objects.filter(reference=reference).exists():
            return reference


def generate_access_token():
    return secrets.token_urlsafe(32)


class Sale(TenantOwned):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        AWAITING_CUSTOMER = "awaiting_customer", "Awaiting customer"
        AWAITING_IDENTITY_REVIEW = "awaiting_identity_review", "Awaiting identity review"
        READY_TO_SIGN = "ready_to_sign", "Ready to sign"
        SIGNED = "signed", "Signed by customer"
        ACCEPTED = "accepted", "Accepted by dealer"
        AWAITING_PAYMENT = "awaiting_payment", "Awaiting payment"
        PAYMENT_CONFIRMED = "payment_confirmed", "Payment confirmed"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    class Produces(models.TextChoices):
        LICENSING = "licensing", "Licensing only"
        CONTRACTS = "contracts", "Contracts only"
        COMPLETE = "complete", "Licensing and contracts"

    class Source(models.TextChoices):
        PORTAL = "portal", "Keyed in the dealer portal"

    class VehicleClass(models.TextChoices):
        MOTORCYCLE = "motorcycle", "Motorcycle"
        MOPED = "moped", "Moped"

    class Condition(models.TextChoices):
        NEW = "new", "New"
        USED = "used", "Used"
        DEMO = "demo", "Demo"

    class Fulfilment(models.TextChoices):
        PICKUP = "pickup", "Collection"
        DELIVERY = "delivery", "Delivery"

    # --- identity and access ------------------------------------------------
    reference = models.CharField(max_length=64, unique=True, blank=True)
    access_token = models.CharField(
        max_length=64, unique=True, default=generate_access_token, editable=False
    )
    # Records that a link has been sent (the send view's own guard) and holds
    # the hash of the password the account adopted at creation. The
    # reference+password sale login it used to serve is retired; account
    # lockout lives with the account, in `freetheplatform.auth`.
    access_password_hash = models.CharField(max_length=128, blank=True)
    created_by = models.ForeignKey(
        "auth.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="created_sales",
    )
    # The customer account this sale belongs to, linked when the link is first
    # sent (the moment the email is fixed and a password exists). The account is
    # how one person sees all their sales — access itself still runs on the
    # sale's own token and cookie. related_name "+" on purpose: the reverse
    # accessor on a tenant-owned model raises (see core.models.tenancy), so
    # queries name the account explicitly through ``all_objects``. SET_NULL: a
    # sale is the dealer's trading record and outlives any account.
    account = models.ForeignKey(
        "auth.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    # The seam a later embedded or DMS entry path writes. One value today, and a
    # column rather than an assumption so adding the second is not a migration
    # plus a backfill.
    source = models.CharField(max_length=20, choices=Source.choices, default=Source.PORTAL)

    # --- plan scope ---------------------------------------------------------
    # Snapshotted from the dealer's plan at creation, never read live: changing
    # plan mid-sale must not rewrite the document set under a customer who is
    # halfway through signing.
    produces = models.CharField(max_length=20, choices=Produces.choices)

    # --- vehicle snapshot ---------------------------------------------------
    # A value snapshot, not a foreign key. FreeTheDesk holds no inventory and
    # should not grow one, and this is the right shape however the data arrives
    # — a later DMS push writes these same fields.
    vehicle_class = models.CharField(
        max_length=20, choices=VehicleClass.choices, default=VehicleClass.MOTORCYCLE
    )
    condition = models.CharField(max_length=10, choices=Condition.choices)
    make = models.CharField(max_length=120, blank=True)
    model_name = models.CharField(max_length=120, blank=True)
    year = models.PositiveSmallIntegerField(null=True, blank=True)
    body_type = models.CharField(max_length=60, blank=True)
    colour = models.CharField(max_length=60, blank=True)
    vin = models.CharField(max_length=17, blank=True)
    engine_number = models.CharField(max_length=64, blank=True)
    engine_capacity_cc = models.PositiveIntegerField(null=True, blank=True)
    is_electric = models.BooleanField(default=False)
    odometer_km = models.PositiveIntegerField(null=True, blank=True)
    registration = models.CharField(max_length=20, blank=True)
    registration_expiry = models.DateField(null=True, blank=True)
    # New stock has no expiry to state — only a term that starts when it is
    # licensed. Used stock carries the date above instead.
    registration_months_included = models.PositiveSmallIntegerField(null=True, blank=True)
    stock_number = models.CharField(max_length=64, blank=True)
    rrp = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # --- money --------------------------------------------------------------
    vehicle_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    balance_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # --- fulfilment ---------------------------------------------------------
    fulfilment_method = models.CharField(
        max_length=20, choices=Fulfilment.choices, default=Fulfilment.DELIVERY
    )
    delivery_address_line1 = models.CharField(max_length=255, blank=True)
    delivery_suburb = models.CharField(max_length=120, blank=True)
    delivery_state = models.CharField(max_length=3, blank=True)
    delivery_postcode = models.CharField(max_length=16, blank=True)

    # --- customer, as the dealer enters them --------------------------------
    customer_name = models.CharField(max_length=120)
    customer_email = models.EmailField(max_length=254)
    customer_phone = models.CharField(max_length=40, blank=True)

    # --- purchaser and licence holder ---------------------------------------
    # Separable, because a vehicle bought by one person and licensed to another
    # is an ordinary sale and it changes which special condition prints.
    purchaser_is_licence_holder = models.BooleanField(default=True)
    purchaser_family_name = models.CharField(max_length=120, blank=True)
    purchaser_given_names = models.CharField(max_length=120, blank=True)
    purchaser_address_line1 = models.CharField(max_length=255, blank=True)
    purchaser_suburb = models.CharField(max_length=120, blank=True)
    purchaser_postcode = models.CharField(max_length=16, blank=True)

    licence_family_name = models.CharField(max_length=120, blank=True)
    licence_given_names = models.CharField(max_length=120, blank=True)
    licence_number = models.CharField(max_length=64, blank=True)
    licence_date_of_birth = models.DateField(null=True, blank=True)
    licensee_address_line1 = models.CharField(max_length=255, blank=True)
    licensee_suburb = models.CharField(max_length=120, blank=True)
    licensee_postcode = models.CharField(max_length=16, blank=True)
    kept_primarily_in_wa = models.BooleanField(default=True)

    licensed_to_company = models.BooleanField(default=False)
    company_name = models.CharField(max_length=180, blank=True)
    company_acn = models.CharField(max_length=11, blank=True)
    company_organisation_code = models.CharField(max_length=64, blank=True)

    # --- warranty -----------------------------------------------------------
    # A hash of the inputs at the moment of acknowledgement. Comparing it with a
    # freshly computed one is what makes an acknowledgement stop counting when a
    # price, year, odometer or condition moves, with no flag to remember to
    # clear. The engine that computes it arrives with the documents app.
    warranty_acknowledgement_key = models.CharField(max_length=64, blank=True)
    warranty_acknowledged_at = models.DateTimeField(null=True, blank=True)

    # --- state and clocks ---------------------------------------------------
    status = models.CharField(
        max_length=32, choices=Status.choices, default=Status.DRAFT, db_index=True
    )
    link_sent_at = models.DateTimeField(null=True, blank=True)
    # What document staleness is measured against.
    details_updated_at = models.DateTimeField(null=True, blank=True)
    signed_at = models.DateTimeField(null=True, blank=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    # Two columns because Schedule 5 cl 1.2 is two acts — the dealer signs, and
    # the dealer gives notice. In practice one request does both, and the day
    # one of them fails is the day a single timestamp becomes unrecoverable.
    acceptance_notified_at = models.DateTimeField(null=True, blank=True)
    customer_marked_paid_at = models.DateTimeField(null=True, blank=True)
    payment_confirmed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta(TenantOwned.Meta):
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(delivery_fee__gte=0)
                    & models.Q(deposit_amount__gte=0)
                    & (models.Q(vehicle_price__isnull=True) | models.Q(vehicle_price__gte=0))
                    & (models.Q(balance_amount__isnull=True) | models.Q(balance_amount__gte=0))
                ),
                name="sale_amounts_non_negative",
            ),
        ]

    def __str__(self) -> str:
        return self.reference

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = generate_reference()
        super().save(*args, **kwargs)

    # Changing any of these makes an already-generated document wrong, which is
    # what ``details_updated_at`` is compared against. Kept as data rather than
    # as a check inside one serializer, because three different callers edit a
    # sale — the dealer, the customer, and a later DMS push — and each of them
    # has to stamp it for staleness to mean anything.
    STALENESS_FIELDS = frozenset({
        "vehicle_class", "condition", "make", "model_name", "year", "body_type",
        "colour", "vin", "engine_number", "engine_capacity_cc", "is_electric",
        "odometer_km", "registration", "registration_expiry",
        "registration_months_included", "stock_number", "rrp",
        "vehicle_price", "delivery_fee", "deposit_amount",
        "fulfilment_method", "delivery_address_line1", "delivery_suburb",
        "delivery_state", "delivery_postcode",
        "customer_name", "customer_email", "customer_phone",
        "purchaser_is_licence_holder", "purchaser_family_name",
        "purchaser_given_names", "purchaser_address_line1", "purchaser_suburb",
        "purchaser_postcode",
        "licence_family_name", "licence_given_names", "licence_number",
        "licence_date_of_birth", "licensee_address_line1", "licensee_suburb",
        "licensee_postcode", "kept_primarily_in_wa",
        "licensed_to_company", "company_name", "company_acn",
        "company_organisation_code",
    })

    @property
    def total_amount(self):
        """Total Purchase Price including GST, in Schedule 5's terms.

        Derived rather than stored. It is the sum of two columns that are
        already here, and a third column holding their total is a third thing
        that can disagree with the other two.
        """
        if self.vehicle_price is None:
            return None
        return self.vehicle_price + (self.delivery_fee or 0)

    def apply_pricing(self):
        """Recompute ``balance_amount`` from the figures it is made of.

        Stored rather than derived — unlike ``total_amount`` — because the
        balance is what a customer is told to transfer, and it has to be the
        number that was true when they were told it rather than one recomputed
        from whatever the sale says later.

        Nobody types it. A dealer entering a price, a delivery fee and a deposit
        has already said everything this needs, and asking them for the
        subtraction as well invites the one figure that matters to be wrong.
        """
        total = self.total_amount
        self.balance_amount = None if total is None else total - (self.deposit_amount or 0)
        return self.balance_amount

    @property
    def is_used_stock(self) -> bool:
        return self.condition != self.Condition.NEW

    @property
    def requires_delivery(self) -> bool:
        return self.fulfilment_method == self.Fulfilment.DELIVERY

    @property
    def produces_contract(self) -> bool:
        return self.produces in (self.Produces.CONTRACTS, self.Produces.COMPLETE)

    @property
    def produces_licensing(self) -> bool:
        return self.produces in (self.Produces.LICENSING, self.Produces.COMPLETE)
