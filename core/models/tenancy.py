"""Tenant scoping for models a dealer owns.

Every dealer's sales sit in one table, so a query that forgets its dealer filter
returns another dealer's customers — their names, dates of birth and licence
numbers — in a perfectly ordinary 200. Nothing raises and nothing logs, and you
find out when a dealer tells you.

``TenantManager`` makes forgetting loud instead. It cannot narrow to the right
dealer by itself: a manager lives on the model class and has no request, so it
does not know who is asking. The alternative is a thread-local holding "the
current dealer", which leaks across async contexts, background tasks and test
cases, and is silently wrong when it is wrong — the exact failure being removed.
So it refuses, and the caller, which does have the request, names the dealer.

**This is a guard rail, not the control.** Who may see what is decided by the
view, and the cross-tenant test on each endpoint is what actually holds the
line. This only stops the deciding being skipped by accident.

Known cost: a reverse accessor on a tenant-owned model raises. Django builds
reverse managers from the related model's *default* manager
(``related_descriptors.py``, ``create_reverse_many_to_one_manager``), so
``dealer.sales_sale_set.all()`` goes through ``get_queryset`` below. That is
accepted rather than worked around — one idiom, ``for_dealer``, everywhere, and
it is more explicit than the accessor it replaces. Forward traversal
(``sale.dealer``) and ``refresh_from_db`` use ``_base_manager`` instead, which
is why ``base_manager_name`` below is not optional.
"""

from django.db import models


class TenantScopeRequired(RuntimeError):
    """An unscoped query was attempted against a tenant-owned model."""


class TenantManager(models.Manager):
    """Refuses to build a queryset that nobody has scoped to a dealer.

    Every queryset method on a manager routes through ``get_queryset``, so
    raising here covers ``.all()``, ``.filter()``, ``.get()`` and
    ``get_object_or_404(Model, ...)`` alike.
    """

    def get_queryset(self):
        raise TenantScopeRequired(
            f"{self.model.__name__} is tenant-owned and this query names no dealer. "
            f"Use {self.model.__name__}.objects.for_dealer(dealer) for anything "
            f"serving a request, or {self.model.__name__}.all_objects for staff, "
            "management commands and migrations."
        )

    def _unscoped(self):
        """The queryset ``get_queryset`` refuses to hand out.

        Named with a leading underscore so that a scoping helper reads as
        deliberate and a call site outside this class reads as a mistake.
        """
        return super().get_queryset()

    def for_dealer(self, dealer):
        return self._unscoped().filter(dealer=dealer)

    def create_for(self, dealer, **kwargs):
        """Create a row owned by ``dealer``.

        ``get_queryset`` refuses every manager method, creation included, so
        this is the way in. Deliberately not left to ``all_objects``: a write
        site is the one place the dealer is never in doubt, and reading
        ``all_objects.create`` there would look like the guard being sidestepped
        rather than satisfied.

        ``for_dealer(dealer).create(...)`` is not an alternative — a plain
        queryset's filters do not flow into ``create``, so it would insert a row
        with no dealer at all.
        """
        return self._unscoped().create(dealer=dealer, **kwargs)

    def get_or_create_for(self, dealer, **kwargs):
        """``get_or_create`` for a row owned by ``dealer``.

        Exists so that "the row for this thing, made on first use" is not
        written as a read followed by a create. That shape races: two requests
        arriving together both see nothing and both insert, and the second gets
        an IntegrityError on whatever uniqueness the model declares. Django's
        own ``get_or_create`` catches exactly that and re-reads.

        Returns ``(obj, created)``, like the method it wraps.
        """
        return self._unscoped().get_or_create(dealer=dealer, **kwargs)


class TenantOwned(models.Model):
    """Abstract base for anything belonging to one dealer.

    A concrete subclass that declares its own ``Meta`` **must inherit this one**
    (``class Meta(TenantOwned.Meta)``), or it loses ``base_manager_name`` and
    Django's own related-object machinery starts raising. Django resets
    ``abstract`` to ``False`` on the subclass automatically, so inheriting Meta
    does not make the child abstract.
    """

    dealer = models.ForeignKey(
        "dealers.Dealer",
        on_delete=models.CASCADE,
        # Distinct per concrete model, and never used in practice — the reverse
        # accessor raises, per the module docstring.
        related_name="%(app_label)s_%(class)s_set",
    )

    # Declaration order matters: the first manager becomes ``_default_manager``,
    # which is what a bare ``Model.objects``-shaped mistake and
    # ``get_object_or_404`` both reach for. Strict has to be first.
    objects = TenantManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True
        # Django traverses a forward FK and reloads a row through the *base*
        # manager. Left pointing at the strict one, ``sale.dealer`` and
        # ``refresh_from_db()`` would raise.
        base_manager_name = "all_objects"
