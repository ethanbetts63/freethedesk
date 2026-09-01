from rest_framework.throttling import AnonRateThrottle


class EnquiryRateThrottle(AnonRateThrottle):
    scope = "enquiry"


class DealerSignupRateThrottle(AnonRateThrottle):
    # Its own bucket: a dealer who already sent an enquiry should not find
    # themselves unable to create an account.
    scope = "dealer-signup"
