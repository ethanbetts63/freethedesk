"""Opening an affiliate account: the login, the code and the free audit, at once.

Runs in one transaction. Nothing is sent from here: the view emails the
verification code and tells staff once the transaction has committed, so a
rollback never leaves somebody holding a code for an account that does not
exist.
"""

from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.utils import timezone
from freetheplatform.auth import issue_email_code

from payments.utils.agreements import (
    AFFILIATE_ACCEPTANCE_STATEMENT,
    AFFILIATE_AGREEMENT_KEY,
    affiliate_offer_context,
    publish_configured_agreement,
    record_checkout_acceptance,
)
from seo.models import SeoSubscriber
from seo.utils.find_login import find_login
from seo.utils.services import ensure_seo_profile

from ..models import Affiliate
from .codes import create_affiliate_discount


class AccountExists(Exception):
    """The email already belongs to a login that can be used."""


def _login_for(email: str):
    """A login for the address: a stale passwordless one if there is one, else new.

    ``find_existing_account`` has already refused an email anyone can sign in
    with. What ``find_login`` can still return is a login an unpaid SEO signup
    made under the old flow: no password, nothing attached, never used. It is
    reused rather than refused, as payment for that email would be.
    """
    return find_login(email) or get_user_model().objects.create_user(
        username=email[:150], email=email, password=None
    )


def complimentary_audit(affiliate: Affiliate) -> SeoSubscriber:
    """The affiliate's free Plus audit, as an active SEO customer on the same login.

    Complimentary rather than paid, so it never reads as revenue, and active
    from the start: there is no payment to wait for. The ordinary SEO setup
    page, access checks and staff pages then serve it unchanged.
    """
    subscriber = SeoSubscriber.objects.create(
        user=affiliate.user,
        email=affiliate.email,
        business_name=affiliate.business_name,
        contact_name=affiliate.contact_name,
        website=affiliate.website,
        plan=SeoSubscriber.Plan.PLUS,
        payment_status=SeoSubscriber.PaymentStatus.COMPLIMENTARY,
        status=SeoSubscriber.Status.ACTIVE,
        status_changed_at=timezone.now(),
    )
    ensure_seo_profile(subscriber)
    return subscriber


@transaction.atomic
def register_affiliate(*, contact_name, email, business_name, website, accepted_ip, user_agent):
    """Open the account. Returns the affiliate and the plain verification code.

    The code is ``None`` when the login already had a password of its own,
    which cannot happen through the public form (it refuses such an email) but
    is cheap to be correct about.
    """
    try:
        user = _login_for(email)
    except IntegrityError as error:
        # Lost the race between the serializer's check and the unique username.
        raise AccountExists from error

    affiliate = Affiliate.objects.create(
        user=user,
        email=email,
        contact_name=contact_name,
        business_name=business_name,
        website=website,
        status=Affiliate.Status.ACTIVE,
        status_changed_at=timezone.now(),
    )
    affiliate.discount = create_affiliate_discount(affiliate)
    affiliate.save(update_fields=["discount", "updated_at"])
    complimentary_audit(affiliate)
    accept_affiliate_terms(affiliate, accepted_ip=accepted_ip, user_agent=user_agent)

    code = None
    if not user.has_usable_password():
        code = issue_email_code(user)
    return affiliate, code


def accept_affiliate_terms(affiliate: Affiliate, *, accepted_ip, user_agent=""):
    """Record the terms ticked on the sign-up form against the new account."""
    agreement_version = publish_configured_agreement(AFFILIATE_AGREEMENT_KEY)
    return record_checkout_acceptance(
        agreement_version=agreement_version,
        accepted_by=None,
        actor_snapshot={"email": affiliate.email},
        related=affiliate,
        accepted_ip=accepted_ip,
        user_agent=user_agent,
        statement=AFFILIATE_ACCEPTANCE_STATEMENT,
        context=affiliate_offer_context(affiliate),
        source="web.signup",
    )
