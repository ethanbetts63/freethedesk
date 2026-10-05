from urllib.parse import urlsplit

from freetheplatform.security import bounds
from rest_framework import serializers

from ..models import SeoSubscriber
from ..utils.existing_account import find_existing_account

ACCOUNT_EXISTS = "account_exists"


class SeoRegistrationSerializer(serializers.Serializer):
    """The signup form: a record of who wants to buy, and no login.

    The login is made when payment lands. Signing up twice is fine and leaves
    two rows; signing up with the email of an account that already exists is
    not, and the error carries ``ACCOUNT_EXISTS`` so the page can offer sign-in.
    """

    business_name = bounds.char("business_name", required=False, allow_blank=True)
    contact_name = bounds.char("name", required=False, allow_blank=True)
    email = bounds.email()
    phone = bounds.char("phone", required=False, allow_blank=True)
    website = bounds.url(required=False, allow_blank=True)
    # A subscription always starts monthly; the slower cadences are reached
    # later by moving the subscriber, so they are not offered here.
    plan = serializers.ChoiceField(
        choices=[(plan.value, plan.label) for plan in SeoSubscriber.SIGNUP_PLANS],
        default=SeoSubscriber.Plan.MONTHLY,
    )
    # The terms are agreed to here, on the form, and recorded by the view;
    # checkout then charges against that acceptance.
    accepted_terms = serializers.BooleanField()

    def validate_accepted_terms(self, value: bool) -> bool:
        if not value:
            raise serializers.ValidationError("Accept the SEO Subscription Terms to continue.")
        return value

    def validate_email(self, value: str) -> str:
        value = value.strip().lower()
        if find_existing_account(value):
            raise serializers.ValidationError(
                "You already have an account with this email.",
                code=ACCOUNT_EXISTS,
            )
        return value

    def create(self, validated_data):
        validated_data.pop("accepted_terms")
        email = validated_data["email"]
        hostname = urlsplit(validated_data.get("website", "")).hostname or email.partition("@")[2]
        if not validated_data.get("business_name"):
            validated_data["business_name"] = hostname.removeprefix("www.")
        if not validated_data.get("contact_name"):
            validated_data["contact_name"] = "Account owner"
        return SeoSubscriber.objects.create(
            payment_status=SeoSubscriber.PaymentStatus.PAYMENT_PENDING, **validated_data
        )
