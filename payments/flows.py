"""The four things a customer can pay for here, named once.

A flow key is this site's own string. ``freetheplatform.payments`` stores it,
dispatches on it, and never interprets it — which makes this module the only
place that knows ``"dealer.subscription"`` means a dealer's recurring listing
fee. What being paid actually entitles somebody to is ``fulfilment.py``.
"""

DEALER_SUBSCRIPTION = "dealer.subscription"
SEO_SUBSCRIPTION = "seo.subscription"
SEO_ONEOFF = "seo.oneoff"
#: A website package's first half, or discovery paid in full.
PACKAGE_ORDER = "package.order"

ALL_FLOWS = (DEALER_SUBSCRIPTION, SEO_SUBSCRIPTION, SEO_ONEOFF, PACKAGE_ORDER)
