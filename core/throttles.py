from rest_framework.throttling import AnonRateThrottle


class EnquiryRateThrottle(AnonRateThrottle):
    scope = "enquiry"
