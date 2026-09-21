"""Bank details, signature and trading hours.

Separate from `DealerOnboardingSerializer` because of what locking means. The
onboarding profile locks while it is being verified — the licence numbers and
the identity documents are the things under review, and letting them move
underneath a reviewer is the failure that lock prevents. None of that applies to
a bank account a dealer needs to correct on a Tuesday, or to a signature image
they want to replace. One screen, two endpoints, and the difference between them
is which fields somebody else is currently looking at.
"""

import re

from freetheplatform.security import bounds
from rest_framework import serializers

from ..models import DealerProfile
from ..utils.uploads import validate_and_rename_upload

BSB = re.compile(r"^(\d{3})-?(\d{3})$")


class DealerTradingSerializer(serializers.ModelSerializer):
    signature_image = serializers.FileField(write_only=True, required=False)
    signature_image_uploaded = serializers.SerializerMethodField()

    class Meta:
        model = DealerProfile
        fields = [
            "bank_account_name", "bank_bsb", "bank_account_number",
            "signature_name", "signature_image", "signature_image_uploaded",
            "trading_hours_note", "updated_at",
        ]
        read_only_fields = ["signature_image_uploaded", "updated_at"]
        extra_kwargs = {
            "bank_account_name": {"max_length": bounds.FIELD_MAX["line"]},
            "signature_name": {"max_length": bounds.FIELD_MAX["line"]},
            # A `TextField`, which reaches DRF unbounded.
            "trading_hours_note": {"max_length": bounds.FIELD_MAX["note"]},
        }

    def get_signature_image_uploaded(self, instance) -> bool:
        return bool(instance.signature_image)

    def validate_bank_bsb(self, value):
        """Stored hyphenated, because that is how a customer will read it.

        A BSB typed as six digits and a BSB typed as ``036-004`` are the same
        number, and the customer checking it against their banking app is
        looking at the hyphenated form. Normalising on the way in means the
        payment instructions page does not have to guess which it was given.
        """
        value = value.strip()
        if not value:
            return ""
        match = BSB.match(value)
        if not match:
            raise serializers.ValidationError("A BSB is six digits, like 036-004.")
        return f"{match.group(1)}-{match.group(2)}"

    def validate_bank_account_number(self, value):
        value = value.strip().replace(" ", "")
        if value and not value.isdigit():
            raise serializers.ValidationError("An account number is digits only.")
        return value

    def validate_signature_image(self, value):
        image, error = validate_and_rename_upload(value)
        if error:
            raise serializers.ValidationError(error)
        return image
