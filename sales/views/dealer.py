"""The dealer's own sales.

Every queryset here starts at ``Sale.objects.for_dealer(request.user.dealer)``.
That is the whole of the tenancy story at the request layer, and it is written
the same way in each view on purpose: a helper that resolved the dealer for you
would move the one line worth reading out of sight.

The dealer is taken from the authenticated user and never from the request. A
dealer id in a query string, a body or a path is ignored wherever one appears —
there is nowhere to put one, which is the intended shape.

See `_docs/licensing/plan/04-dealer-portal.md`.
"""

from django.db.models import Q
from django.utils import timezone
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView

from core.utils.ordering import apply_ordering
from core.utils.pagination import DashboardPagination
from dealers.utils.permissions import IsOperatingDealer
from sales.models import Sale
from sales.serializers import (
    DEALER_ACTION_STATUSES,
    DealerSaleSerializer,
    SaleListSerializer,
)

SALE_ORDERING = {
    "created_at": ("created_at",),
    "updated_at": ("updated_at",),
    "reference": ("reference",),
    "customer_name": ("customer_name",),
    "status": ("status",),
    "signed_at": ("signed_at",),
}


class DealerSaleQuerysetMixin:
    """One place the dealer is resolved, for the two views that serve a sale."""

    permission_classes = [IsOperatingDealer]

    def dealer_sales(self):
        return Sale.objects.for_dealer(self.request.user.dealer)


class DealerSaleListView(DealerSaleQuerysetMixin, ListCreateAPIView):
    """The queue, and the screen that creates a sale."""

    throttle_scope = "portal"  # A dealer or subscriber acting on their own record.
    pagination_class = DashboardPagination

    def get_serializer_class(self):
        return DealerSaleSerializer if self.request.method == "POST" else SaleListSerializer

    def get_queryset(self):
        params = self.request.query_params
        queryset = self.dealer_sales()

        status = params.get("status", "").strip()
        if status:
            queryset = queryset.filter(
                status__in=[part.strip() for part in status.split(",") if part.strip()]
            )
        # The queue's default view. A sale needs the dealer when it is waiting on
        # them and not on the customer, and that is the only sort that matters.
        if params.get("needs_action", "").strip().lower() in {"1", "true", "yes"}:
            queryset = queryset.filter(status__in=DEALER_ACTION_STATUSES)

        search = params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(reference__icontains=search)
                | Q(customer_name__icontains=search)
                | Q(customer_email__icontains=search)
                | Q(make__icontains=search)
                | Q(model_name__icontains=search)
                | Q(vin__icontains=search)
                | Q(stock_number__icontains=search)
                | Q(registration__icontains=search)
            )
        return apply_ordering(queryset, params, SALE_ORDERING)

    def perform_create(self, serializer):
        """Create the sale against the dealer, with the plan snapshotted onto it.

        ``produces`` is taken from the dealer's plan here and never read live
        afterwards. A dealer who changes plan halfway through a sale must not
        have the document set rewritten underneath a customer who is part way
        through signing it.
        """
        dealer = self.request.user.dealer
        serializer.save(
            dealer=dealer,
            produces=dealer.plan,
            created_by=self.request.user,
        )


class DealerSaleDetailView(DealerSaleQuerysetMixin, RetrieveUpdateAPIView):
    """One sale: everything about it, and the edits the dealer may make."""

    throttle_scope = "portal"  # A dealer or subscriber acting on their own record.
    serializer_class = DealerSaleSerializer
    lookup_field = "reference"
    lookup_url_kwarg = "reference"
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        return self.dealer_sales()

    def perform_update(self, serializer):
        """Save the edit, and stamp it if it invalidates the paperwork.

        ``details_updated_at`` is what document staleness is measured against,
        so it moves only when a field that actually prints has changed. Stamping
        on every save would make every document permanently stale; never
        stamping would let a name be corrected after signing and leave the
        signed copy looking current.
        """
        changed = {
            field
            for field in serializer.validated_data
            if field in Sale.STALENESS_FIELDS
            and serializer.validated_data[field] != getattr(serializer.instance, field)
        }
        # Passed into the one save rather than written by a second one. The
        # serializer's `update` sets whatever arrives here like any other field.
        serializer.save(**({"details_updated_at": timezone.now()} if changed else {}))
