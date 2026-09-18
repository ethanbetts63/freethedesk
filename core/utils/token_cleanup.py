"""Opportunistic removal of expired JWT blacklist rows.

Turning on ``BLACKLIST_AFTER_ROTATION`` makes simplejwt write an
``OutstandingToken`` row for every refresh token issued and a
``BlacklistedToken`` row for every one rotated away. Nothing in simplejwt
removes them; it ships a ``flushexpiredtokens`` command and leaves scheduling
to the project.

This host has no scheduler we control, and a cron job that silently stops
running is worse than no cron job, because the table grows without anybody
being told. So the flush is attached to something that already happens and is
not time sensitive: a successful login.

Three constraints follow from that, and each is load bearing:

1. A cleanup failure must never fail the login. Every call is wrapped.
2. The deletion is bounded, so the login that triggered it stays fast.
3. It skips if it ran recently, so a busy morning does not run it repeatedly.

The "ran recently" marker lives in the default cache. This project declares no
``CACHES`` block at all, so that is Django's implicit per-process local memory:
cleared by every restart, and bounded small enough to cull the marker. Both
failure modes make the flush run *more* often than intended, never less, so the
marker does not need to be durable.

Kept deliberately identical to allbikes' copy of the same file. Two copies is
one too many; neither repository can import the other's today, and the shared
package is not a dependency here for this. Change both or neither.
"""

import logging

from django.core.cache import cache
from django.utils import timezone

logger = logging.getLogger(__name__)

CLEANUP_CACHE_KEY = 'jwt_expired_token_cleanup_ran'

# A day. Expired rows are inert, so lateness costs storage, never security.
CLEANUP_INTERVAL_SECONDS = 24 * 60 * 60

# Deleted per run. Staff, dealers and SEO subscribers all log in here, but the
# volume is still far below this; it is a ceiling on how long one unlucky login
# can wait, not a target. Revisit if the account count grows by orders of
# magnitude, which is when a bound this size may stop keeping up.
CLEANUP_BATCH_SIZE = 1000


def purge_expired_tokens():
    """Delete a bounded batch of expired outstanding tokens.

    Deleting the ``OutstandingToken`` cascades to its ``BlacklistedToken``, so
    this clears both tables. Returns the number of rows deleted, or ``None`` if
    the run was skipped.
    """
    from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

    expired_ids = list(
        OutstandingToken.objects
        .filter(expires_at__lte=timezone.now())
        .values_list('id', flat=True)[:CLEANUP_BATCH_SIZE]
    )
    if not expired_ids:
        return 0

    deleted, _ = OutstandingToken.objects.filter(id__in=expired_ids).delete()
    return deleted


def purge_expired_tokens_if_due():
    """Run :func:`purge_expired_tokens` at most once per interval, never raising.

    The marker is set before the work rather than after. If the delete fails,
    the next login should not retry it immediately — a database problem would
    then be paid for by every login that followed. Expired rows can wait a day.
    """
    try:
        if cache.get(CLEANUP_CACHE_KEY):
            return

        cache.set(CLEANUP_CACHE_KEY, True, timeout=CLEANUP_INTERVAL_SECONDS)

        deleted = purge_expired_tokens()
        if deleted:
            logger.info("Purged %s expired JWT blacklist rows.", deleted)
    except Exception:
        # Never fail a login for this.
        logger.exception("Expired JWT token cleanup failed.")
