"""The password policy, asserted rather than assumed.

``AUTH_PASSWORD_VALIDATORS`` is configuration: nothing fails loudly if an
``OPTIONS`` block is dropped in a merge, and every existing account keeps
working because validators run only when a password is set. A test is the only
thing that notices.
"""

import pytest
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from core.tests.factories import UserFactory


def test_eleven_characters_is_rejected():
    """One character below the minimum does not pass."""
    with pytest.raises(ValidationError):
        validate_password("Kq7zvR2mXp4")


def test_twelve_characters_is_accepted():
    """Pins the boundary from both sides.

    A test that only checked rejection would still pass if somebody set the
    minimum to 40.
    """
    validate_password("Kq7zvR2mXp4w")


def test_djangos_default_of_eight_is_not_in_force():
    """Guards the OPTIONS block quietly disappearing.

    That would leave the validator present, passing, and useless.
    """
    with pytest.raises(ValidationError):
        validate_password("Kq7zvR2m")


@pytest.mark.django_db
def test_a_password_resembling_the_username_is_rejected():
    """Raising the minimum should not have displaced the other validators."""
    user = UserFactory(username="seamusoconnor")

    with pytest.raises(ValidationError):
        validate_password("seamusoconnor", user)
