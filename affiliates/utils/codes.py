"""The discount codes an affiliate hands out.

The first is made from the podcast's name at sign-up: "The Tradie Show"
becomes ``THETRADIESHOW20``, the name with everything but letters and digits
removed, then the discount, so the code reads as the listener's saving and the
host's show at once. The affiliate can add more of their own choosing, up to
``CODE_LIMIT``, each worth the same discount and earning the same commission.
Codes are matched with case and spaces ignored (``normalise_code``), so
uniqueness is checked on that form, across every code the site has ever
issued: a removed code stays on the payments that redeemed it.
"""

import re

from django.contrib.contenttypes.models import ContentType
from freetheplatform.payments import DiscountApplication, DiscountCode, DiscountKind
from freetheplatform.payments.models.discount import normalise_code

from core.models import SiteSettings
from payments.flows import SEO_ONEOFF

FALLBACK_STEM = "PODCAST"
STEM_LENGTH = 20

#: How many codes one affiliate may hold, the sign-up one included.
CODE_LIMIT = 10
#: What an affiliate may name a code: letters, digits and hyphens.
CODE_PATTERN = re.compile(r"^[A-Za-z0-9-]{3,24}$")
CODE_RULE = "A code is 3 to 24 letters, digits or hyphens."


class CodeError(Exception):
    """Why a code the affiliate asked for cannot be made. The message is for them."""


def code_stem(business_name: str) -> str:
    stem = re.sub(r"[^A-Za-z0-9]", "", business_name or "")[:STEM_LENGTH].upper()
    return stem or FALLBACK_STEM


def code_is_taken(code: str) -> bool:
    """Every code counts, inactive ones included; see the module docstring."""
    return DiscountCode.objects.filter(normalised_code=normalise_code(code)).exists()


def unused_code(business_name: str, percent: int) -> str:
    """A code nobody holds: the stem and the discount, then a counter if taken."""
    base = f"{code_stem(business_name)}{percent}"
    candidate = base
    counter = 2
    while code_is_taken(candidate):
        candidate = f"{base}-{counter}"
        counter += 1
    return candidate


def affiliate_codes(affiliate):
    """Every code the affiliate holds, oldest first: the sign-up one, then their own."""
    return DiscountCode.objects.filter(
        owner_content_type=ContentType.objects.get_for_model(affiliate),
        owner_object_id=str(affiliate.pk),
    ).order_by("created_at")


def _make_code(affiliate, code: str, percent) -> DiscountCode:
    """A percentage code owned by the affiliate, valid on the SEO audit only."""
    return DiscountCode.objects.create(
        code=code,
        kind=DiscountKind.PERCENTAGE,
        percentage=percent,
        application=DiscountApplication.ONCE,
        flows=[SEO_ONEOFF],
        owner_content_type=ContentType.objects.get_for_model(affiliate),
        owner_object_id=str(affiliate.pk),
    )


def create_affiliate_discount(affiliate) -> DiscountCode:
    """The sign-up code for one affiliate.

    The percentage is the site's listener discount on the day the affiliate
    signs up. Changing the setting later changes new codes, not this one:
    Stripe coupons are immutable and the page the listener saw said this
    number, so an existing code keeps its percentage.
    """
    percent = SiteSettings.load().affiliate_discount_percent
    return _make_code(affiliate, unused_code(affiliate.business_name, percent), percent)


def create_named_code(affiliate, code: str) -> DiscountCode:
    """A code the affiliate chose, worth what their sign-up code is worth.

    Raises ``CodeError`` with the reason when it cannot be made: the account
    is not active, the name breaks the rule, it is taken, or they hold the
    limit already.
    """
    if not affiliate.is_active:
        raise CodeError("Codes can only be added on an active account.")
    # Spaces are ignored when a code is matched, so they are ignored here too.
    code = normalise_code(code)
    if not CODE_PATTERN.match(code):
        raise CodeError(CODE_RULE)
    if affiliate_codes(affiliate).count() >= CODE_LIMIT:
        raise CodeError(f"You already hold {CODE_LIMIT} codes, which is the most one account can.")
    if code_is_taken(code):
        raise CodeError("That code is taken. Try another.")
    percent = (
        affiliate.discount.percentage
        if affiliate.discount is not None and affiliate.discount.percentage is not None
        else SiteSettings.load().affiliate_discount_percent
    )
    return _make_code(affiliate, code, percent)


def remove_code(affiliate, code_id) -> DiscountCode:
    """Switch one of the affiliate's own codes off. The sign-up code stays.

    Off rather than deleted: the payments it was redeemed on keep pointing at
    it. Raises ``CodeError`` when the code is not theirs to remove.
    """
    code = affiliate_codes(affiliate).filter(pk=code_id).first()
    if code is None:
        raise CodeError("That code is not one of yours.")
    if affiliate.discount_id == code.pk:
        raise CodeError("Your sign-up code stays; listeners already have it.")
    if code.is_active:
        code.is_active = False
        code.save(update_fields=["is_active", "updated_at"])
    return code
