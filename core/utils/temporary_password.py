"""The first password an account is given, for its owner to replace.

Shared by every flow that creates an account on somebody's behalf (a sale's
customer, a paid SEO subscriber). Callers set ``must_change_password`` alongside
it, so the account's first sign-in asks for a password of the owner's choosing.
"""

import secrets

#: Avoids the characters people mistake for each other when reading a password
#: off a screen and typing it on a phone: no O/0, no I/l/1.
_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
_LENGTH = 12


def generate_temporary_password() -> str:
    """A plain temporary password. Only ever returned, never persisted as-is."""
    return "".join(secrets.choice(_ALPHABET) for _ in range(_LENGTH))
