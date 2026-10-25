"""What the API says about whoever is signed in.

Supplied to `freetheplatform.auth` through `FTP_AUTH["PRINCIPAL"]`, and the only
part of the session that is ours: the package owns cookies, rotation and
revocation, but `role` is computed from dealers, SEO subscribers and affiliates,
which no shared package can know about.

One shape for every portal rather than a staff endpoint and a near-identical
dealer one. The frontend routes on `role` alone; `dealer`, `seo` and `affiliate`
are null for anyone who is not one. An affiliate also has an SEO subscriber (the
free audit on the same login), so `affiliate` is decided before `seo`. `is_staff` stays a Django-internal flag — it drives the
`role` computation below and nothing else crosses the wire.
"""

from rest_framework.exceptions import PermissionDenied


def _is_customer(user):
    """Whether a sale has ever been sent to this account's email.

    Imported lazily and queried through ``all_objects``: the reverse accessor
    on a tenant-owned model raises by design (see ``core.models.tenancy``), and
    here the account itself is the scope — a customer's sales deliberately
    cross dealers.
    """
    from sales.models import Sale

    return Sale.all_objects.filter(account=user).exists()


def principal(user):
    """Describe `user`, or refuse an account with no portal to enter.

    Authenticating correctly and belonging somewhere are different questions.
    An account that is none of staff, dealer, affiliate, subscriber or sale customer has
    answered the first and failed the second, so this raises rather than
    returning a payload the frontend would have to check — a 403, not a 401.

    A dealer awaiting approval, suspended or denied still signs in: the portal
    shows them where they stand rather than a generic authentication error.
    """
    dealer = getattr(user, "dealer", None)
    seo = getattr(user, "seo_subscriber", None)
    affiliate = getattr(user, "affiliate", None)
    role = (
        "staff" if user.is_staff
        else "dealer" if dealer is not None
        else "affiliate" if affiliate is not None
        else "seo" if seo is not None
        else "customer" if _is_customer(user)
        else "none"
    )
    if role == "none":
        raise PermissionDenied("This account does not have portal access.")

    return {
        "id": user.pk,
        "username": user.get_username(),
        "email": user.email,
        "role": role,
        "dealer": None if dealer is None else {
            "id": dealer.pk,
            "business_name": dealer.business_name,
            "contact_name": dealer.contact_name,
            "status": dealer.status,
            "status_label": dealer.get_status_display(),
        },
        "seo": None if seo is None else {
            "id": seo.pk,
            "business_name": seo.business_name,
            "contact_name": seo.contact_name,
            "status": seo.status,
            "status_label": seo.get_status_display(),
        },
        "affiliate": None if affiliate is None else {
            "id": affiliate.pk,
            "business_name": affiliate.business_name,
            "contact_name": affiliate.contact_name,
            "status": affiliate.status,
            "status_label": affiliate.get_status_display(),
        },
    }
