from .find_login import find_login


def find_existing_account(email: str):
    """The login for ``email`` if it is a real account, else None.

    Real means someone can sign in to it or it belongs somewhere: a password,
    staff, a dealership, an SEO subscription or a customer's sales. What is
    left is a login an unpaid signup made under the old flow, never used and
    no way in; payment for that email reuses it rather than refusing.

    Signup and checkout both refuse an email this returns, so a paid customer
    is sent to sign in instead of paying twice. Saying so tells anyone typing
    an email whether that person has an account, which the product accepts.
    """
    from sales.models import Sale

    user = find_login(email)
    if user is None:
        return None
    if (
        user.has_usable_password()
        or user.is_staff
        or getattr(user, "dealer", None) is not None
        or getattr(user, "seo_subscriber", None) is not None
        or Sale.all_objects.filter(account=user).exists()
    ):
        return user
    return None
