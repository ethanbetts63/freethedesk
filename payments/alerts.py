"""Telling somebody when a Stripe event will not process.

Wired up through ``FTP_PAYMENTS['ALERT_HANDLER']``. The package cannot send
this itself — FreeThePlatform apps do not import each other — and it is the
site that knows who to tell.
"""

import logging

from django.conf import settings
from freetheplatform.messaging import send


logger = logging.getLogger(__name__)


def alert_failed_event(*, event):
    """Email staff once a webhook event looks permanently stuck.

    Fires once per event rather than once per retry. Stripe gives up after
    about three days and then disables the endpoint, so the window in which
    this is useful is the window in which somebody can still fix it and have
    the retry succeed.
    """
    if not settings.ADMIN_EMAIL:
        logger.error(
            "Stripe event %s failed %s times and ADMIN_EMAIL is unset.",
            event.stripe_event_id, event.attempt_count,
        )
        return

    send(
        to=settings.ADMIN_EMAIL,
        channel="email",
        message_type="payments.webhook_failed",
        subject=f"Stripe webhook failing: {event.event_type}",
        body=(
            f"Stripe event {event.stripe_event_id} ({event.event_type}) has "
            f"failed {event.attempt_count} times and will stop being retried "
            f"in about three days.\n\n"
            f"Stripe object: {event.stripe_object_id or 'unknown'}\n"
            f"Last error: {event.last_error}\n\n"
            "Until this processes, whatever the customer paid for has not been "
            "provisioned."
        ),
        related=event,
    )
