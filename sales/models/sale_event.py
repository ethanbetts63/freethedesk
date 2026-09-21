"""The audit trail, which is the product.

Every state change writes one row carrying who did it, when, and from where.
This is what a dealer points at in a dispute, and it is the same argument as the
identity layer: the value is not that the paperwork exists, it is that its
history is provable.

Append-only. Nothing updates a row and the application has no delete path.
"""

from django.db import models

from core.models import TenantManager, TenantOwned


class SaleEventManager(TenantManager):
    """Adds the scoping a sale's own timeline needs.

    ``for_sale`` is safe without naming a dealer because the sale it is given
    was itself fetched through ``for_dealer`` — the scoping has already
    happened, one level up, and repeating it here would read as though it had
    not.

    It exists because the natural idiom, ``sale.events.all()``, raises: Django
    builds reverse managers from the related model's default manager, which is
    this one. See ``core.models.tenancy``.
    """

    def for_sale(self, sale):
        return self._unscoped().filter(sale=sale)


class SaleEvent(TenantOwned):
    sale = models.ForeignKey("sales.Sale", on_delete=models.CASCADE, related_name="events")
    kind = models.CharField(max_length=64)
    # Nullable because the customer has no user row — they hold a capability,
    # not an identity. ``actor_label`` is then the only honest answer to who
    # did this, and it is recorded at the time rather than derived later.
    actor = models.ForeignKey(
        "auth.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="sale_events",
    )
    actor_label = models.CharField(max_length=120, blank=True)
    at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    context = models.JSONField(default=dict, blank=True)

    objects = SaleEventManager()
    all_objects = models.Manager()

    class Meta(TenantOwned.Meta):
        ordering = ["at", "id"]

    def __str__(self) -> str:
        return f"{self.sale_id}: {self.kind}"
