from freetheplatform.auth.throttling import ScopedAnonThrottle


class EnquiryRateThrottle(ScopedAnonThrottle):
    scope = "enquiry"


class DealerSignupRateThrottle(ScopedAnonThrottle):
    # Its own bucket: a dealer who already sent an enquiry should not find
    # themselves unable to create an account.
    scope = "dealer-signup"


class SeoSignupRateThrottle(ScopedAnonThrottle):
    scope = "seo-signup"
