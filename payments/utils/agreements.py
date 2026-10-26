"""FTD agreement definitions and the evidence shown during checkout."""

from django.core.exceptions import ImproperlyConfigured
from freetheplatform.agreements import (
    AgreementNotPublished,
    AgreementVersionConflict,
    accept,
    publish_configured,
)


DEALER_AGREEMENT_KEY = "dealer.subscription"
DEALER_ACCEPTANCE_STATEMENT = (
    "I agree to the Dealer Subscription Terms, acknowledge the Privacy Policy, "
    "and authorise this monthly subscription."
)

SEO_AGREEMENT_KEY = "seo.reporting"

AFFILIATE_AGREEMENT_KEY = "affiliate.program"
AFFILIATE_ACCEPTANCE_STATEMENT = (
    "I agree to the Affiliate Program Terms and the SEO Audit Terms, "
    "and acknowledge the Privacy Policy."
)

PACKAGE_AGREEMENT_KEY = "webdev.services"
PACKAGE_ACCEPTANCE_STATEMENT = (
    "I agree to the Web Development Terms, acknowledge the Privacy Policy, "
    "and authorise this payment."
)


class AgreementConfigurationError(Exception):
    pass


def publish_configured_agreement(key):
    try:
        agreement_version, _ = publish_configured(key)
    except (AgreementNotPublished, AgreementVersionConflict, ImproperlyConfigured) as error:
        raise AgreementConfigurationError(str(error)) from error
    return agreement_version


def dealer_offer_context(quote):
    return {
        "plan": quote.plan,
        "price": str(quote.monthly_price),
        "currency": quote.currency.upper(),
        "billing_mode": "subscription",
        "billing_interval": "month",
        "tax_inclusive": True,
    }


def seo_offer_context(subscriber, quote):
    return {
        "plan": subscriber.plan,
        "price": str(quote.price),
        "currency": quote.currency.upper(),
        "billing_mode": "payment",
        "tax_inclusive": True,
    }


def affiliate_offer_context(affiliate):
    """The offer as it stood when the host joined: their code and its two numbers."""
    from core.models import SiteSettings

    site = SiteSettings.load()
    return {
        "code": affiliate.code,
        "discount_percent": site.affiliate_discount_percent,
        "share_percent": site.affiliate_share_percent,
    }


SEO_ACCEPTANCE_STATEMENT = (
    "I agree to the SEO Audit Terms, acknowledge the Privacy Policy, "
    "and authorise this payment."
)


def record_checkout_acceptance(
    *, agreement_version, accepted_by, related, accepted_ip, user_agent,
    statement, context, actor_snapshot=None, source="web.checkout",
):
    acceptance, _ = accept(
        agreement=agreement_version,
        accepted_by=accepted_by,
        related=related,
        accepted_ip=accepted_ip,
        user_agent=user_agent,
        statement=statement,
        context=context,
        source=source,
        actor_snapshot=actor_snapshot,
    )
    return acceptance


def package_offer_context(quote):
    """What a package order's acceptance agreed to: the package, its price and the share due now."""
    return {
        "package": quote.package,
        "price": str(quote.price),
        "due_now": str(quote.due_now),
        "currency": quote.currency.upper(),
        "billing_mode": "payment",
        "tax_inclusive": True,
    }
