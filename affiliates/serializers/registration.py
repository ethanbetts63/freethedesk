from freetheplatform.security import bounds
from rest_framework import serializers

from seo.utils.existing_account import find_existing_account

ACCOUNT_EXISTS = "account_exists"


class AffiliateRegistrationSerializer(serializers.Serializer):
    """The sign-up form on /affiliates: who the host is and what to call the code.

    No password: the account is opened by an emailed code (see
    ``freetheplatform.auth.codes``). An email that already has an account is
    refused with ``ACCOUNT_EXISTS`` so the page can offer sign-in instead; the
    view opens the account, so this serializer only validates.
    """

    contact_name = bounds.char("name")
    email = bounds.email()
    business_name = bounds.char("business_name")
    # Optional: the free audit is a bonus, and a host without a site can still
    # sell audits. The portal's setup page asks for it again.
    website = bounds.url(required=False, allow_blank=True, default="")
    accepted_terms = serializers.BooleanField()

    def validate_accepted_terms(self, value: bool) -> bool:
        if not value:
            raise serializers.ValidationError("Accept the Affiliate Program Terms to continue.")
        return value

    def validate_email(self, value: str) -> str:
        value = value.strip().lower()
        if find_existing_account(value):
            raise serializers.ValidationError(
                "You already have an account with this email.",
                code=ACCOUNT_EXISTS,
            )
        return value
