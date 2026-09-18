"""What the API says about whoever is signed in.

Supplied to `freetheplatform.auth` through `FTP_AUTH["PRINCIPAL"]`, and the only
part of the session that is ours: the package owns cookies, rotation and
revocation, but `role` is computed from dealers and SEO subscribers, which no
shared package can know about.

One shape for both portals rather than a staff endpoint and a near-identical
dealer one. The frontend routes on `role` alone; `dealer` and `seo` are null for
anyone who is not one. `is_staff` stays a Django-internal flag — it drives the
`role` computation below and nothing else crosses the wire.
"""

from rest_framework.exceptions import PermissionDenied


def principal(user):
    """Describe `user`, or refuse an account with no portal to enter.

    Authenticating correctly and belonging somewhere are different questions.
    An account that is neither staff, dealer nor subscriber has answered the
    first and failed the second, so this raises rather than returning a payload
    the frontend would have to check — a 403, not a 401.

    A dealer awaiting approval, suspended or denied still signs in: the portal
    shows them where they stand rather than a generic authentication error.
    """
    dealer = getattr(user, "dealer", None)
    seo = getattr(user, "seo_subscriber", None)
    role = (
        "staff" if user.is_staff
        else "dealer" if dealer is not None
        else "seo" if seo is not None
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
    }
