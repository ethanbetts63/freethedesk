from decimal import Decimal

from freetheplatform.agreements import accept

from dealers.tests.factories import DealerFactory
from payments.utils.agreements import (
    DEALER_ACCEPTANCE_STATEMENT,
    DEALER_AGREEMENT_KEY,
    publish_configured_agreement,
)


def DealerAgreementAcceptanceFactory(
    *, dealer=None, accepted_by=None, plan=None, monthly_price=Decimal("199.00"),
    currency="AUD", stripe_checkout_session_id="", **kwargs,
):
    """Create shared agreement evidence for dealer webhook tests."""
    dealer = dealer or DealerFactory()
    accepted_by = accepted_by or dealer.user
    version = publish_configured_agreement(DEALER_AGREEMENT_KEY)
    acceptance, _ = accept(
        agreement=version,
        accepted_by=accepted_by,
        related=dealer,
        statement=DEALER_ACCEPTANCE_STATEMENT,
        context={
            "plan": plan or dealer.plan,
            "price": str(monthly_price),
            "currency": currency,
            "billing_mode": "subscription",
            "billing_interval": "month",
            "tax_inclusive": True,
        },
        metadata={"legacy_stripe_checkout_session_id": stripe_checkout_session_id},
        source="web.checkout",
        **kwargs,
    )
    return acceptance
