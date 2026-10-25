"""The discount code an affiliate hands out, made from the podcast's name.

"The Tradie Show" becomes ``THETRADIESHOW20``: the name with everything but
letters and digits removed, then the discount, so the code reads as the
listener's saving and the host's show at once. Codes are matched with case and
spaces ignored (``normalise_code``), so uniqueness is checked on that form.
"""

import re

from django.contrib.contenttypes.models import ContentType
from freetheplatform.payments import DiscountApplication, DiscountCode, DiscountKind
from freetheplatform.payments.models.discount import normalise_code

from core.models import SiteSettings
from payments.flows import SEO_ONEOFF

FALLBACK_STEM = "PODCAST"
STEM_LENGTH = 20


def code_stem(business_name: str) -> str:
    stem = re.sub(r"[^A-Za-z0-9]", "", business_name or "")[:STEM_LENGTH].upper()
    return stem or FALLBACK_STEM


def unused_code(business_name: str, percent: int) -> str:
    """A code nobody holds: the stem and the discount, then a counter if taken.

    Every code counts, inactive ones included: a removed affiliate's code stays
    on its redeemed payments, so a host re-registering under the same name is
    given a new one rather than the old.
    """
    base = f"{code_stem(business_name)}{percent}"
    candidate = base
    counter = 2
    while DiscountCode.objects.filter(normalised_code=normalise_code(candidate)).exists():
        candidate = f"{base}-{counter}"
        counter += 1
    return candidate


def create_affiliate_discount(affiliate) -> DiscountCode:
    """The percentage code for one affiliate, valid on the SEO audit only.

    The percentage is the site's listener discount on the day the affiliate
    signs up. Changing the setting later changes new codes, not this one:
    Stripe coupons are immutable and the page the listener saw said this
    number, so an existing code keeps its percentage.
    """
    percent = SiteSettings.load().affiliate_discount_percent
    return DiscountCode.objects.create(
        code=unused_code(affiliate.business_name, percent),
        kind=DiscountKind.PERCENTAGE,
        percentage=percent,
        application=DiscountApplication.ONCE,
        flows=[SEO_ONEOFF],
        owner_content_type=ContentType.objects.get_for_model(affiliate),
        owner_object_id=str(affiliate.pk),
    )
