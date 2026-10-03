from django.contrib.auth import get_user_model
from django.db.models import Q


def find_login(email: str):
    """The login using ``email``, if any. ``username == email`` for signups, so
    either column can hold it."""
    email = email.strip().lower()
    return (
        get_user_model()
        .objects.filter(Q(email__iexact=email) | Q(username__iexact=email[:150]))
        .first()
    )
