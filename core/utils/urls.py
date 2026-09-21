"""Where this site lives, as one answer.

``SITE_URL`` is configured with or without a trailing slash depending on who set
the environment variable, so every caller that builds a link has to normalise it.
That normalisation was written out nine times across five apps, which is nine
chances to get a double slash into an email and five places to edit the day a
customer-facing path moves behind a prefix.
"""

from django.conf import settings


def site_url() -> str:
    """The site's base URL with no trailing slash, safe to concatenate onto."""
    return settings.SITE_URL.rstrip("/")
