from decimal import Decimal

from freetheplatform.agreements import accept

from payments.utils.agreements import (
    SEO_ACCEPTANCE_STATEMENT,
    SEO_AGREEMENT_KEY,
    publish_configured_agreement,
)
from seo.models import SeoSubscriber
from seo.tests.factories import SeoSubscriberFactory


def SeoAgreementAcceptanceFactory(
    *, subscriber=None, accepted_by=None, plan=None,
    price=Decimal("150.00"), currency="AUD", stripe_checkout_session_id="", **kwargs,
):
    """Create shared agreement evidence for SEO webhook tests."""
    subscriber = subscriber or SeoSubscriberFactory()
    accepted_by = accepted_by or subscriber.user
    plan = plan or subscriber.plan
    # The retired subscriptions still renew, so webhook tests use them too.
    recurring = {SeoSubscriber.Plan.MONTHLY, SeoSubscriber.Plan.QUARTERLY, SeoSubscriber.Plan.YEARLY}
    mode = "subscription" if plan in recurring else "payment"
    version = publish_configured_agreement(SEO_AGREEMENT_KEY)
    acceptance, _ = accept(
        agreement=version,
        accepted_by=accepted_by,
        related=subscriber,
        statement=SEO_ACCEPTANCE_STATEMENT,
        context={
            "plan": plan,
            "price": str(price),
            "currency": currency,
            "billing_mode": mode,
            "tax_inclusive": True,
        },
        metadata={"legacy_stripe_checkout_session_id": stripe_checkout_session_id},
        source="web.checkout",
        **kwargs,
    )
    return acceptance
