"""Publishing and accepting the dealer's Special Conditions.

Published through ``publish_version`` rather than ``publish_configured``,
because the text is built from ``special_conditions.py`` rather than read from a
file. A second copy of a contract term sitting in a markdown file beside the one
that actually prints is one copy that can be edited without the other, and the
half that gets edited is never reliably the half that ships.

``publish_version`` is idempotent for identical content, so calling it on every
save is cheap and means the version a dealer accepts is always the version that
exists.
"""

from freetheplatform.agreements import accept, publish_version

from . import special_conditions


def publish_special_conditions():
    agreement_version, _ = publish_version(
        key=special_conditions.AGREEMENT_KEY,
        title=special_conditions.AGREEMENT_TITLE,
        version=special_conditions.VERSION,
        content=special_conditions.published_text(),
        content_format="markdown",
    )
    return agreement_version


def record_special_conditions_acceptance(
    *, dealer, user, choices, accepted_ip=None, user_agent=""
):
    """Record what this dealer chose, when, and who chose it.

    The choices go in ``context`` rather than only into
    ``DealerProfile.condition_choices``. The column is current state and is
    overwritten on the next save; the acceptance is immutable, so the dated
    record of what was removed and by whom survives the next edit. That record
    is the evidence that the dealer exercised judgment, which is worth more here
    than immutability of the set itself.
    """
    acceptance, _ = accept(
        agreement=publish_special_conditions(),
        accepted_by=user,
        related=dealer,
        accepted_ip=accepted_ip,
        user_agent=user_agent,
        statement=special_conditions.ACCEPTANCE_STATEMENT,
        context={
            "defaults": choices["defaults"],
            "additions": choices["additions"],
            "catalogue_version": special_conditions.VERSION,
        },
        source="web.portal",
    )
    return acceptance
