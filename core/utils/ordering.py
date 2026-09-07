def apply_ordering(queryset, params, ordering_map, default="-created_at"):
    """Order ``queryset`` from a request's ``?ordering=`` query param.

    ``ordering_map`` maps a bare field name (no ``-`` prefix) to the tuple of
    model fields it should sort by; an unrecognised or missing value falls back
    to ``("created_at",)``. A leading ``-`` on the requested value reverses
    every field in the tuple. ``-id`` is always appended as a final tiebreaker
    so pagination stays stable across equal sort keys.
    """
    ordering = params.get("ordering", "").strip() or default
    descending = ordering.startswith("-")
    fields = ordering_map.get(ordering.lstrip("-"), ("created_at",))
    if descending:
        fields = tuple(f"-{field}" for field in fields)
    return queryset.order_by(*fields, "-id")
