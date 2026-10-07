from freetheplatform.security import bounds
from rest_framework import serializers

from ..models import InvoiceSettings


class InvoiceSettingsSerializer(serializers.ModelSerializer):
    # A model TextField has no length to inherit, so the bound is stated.
    address = bounds.text("note", required=False, allow_blank=True)

    class Meta:
        model = InvoiceSettings
        fields = [
            "business_name", "legal_name", "abn", "address", "email", "phone", "website",
            "bank_account_name", "bank_bsb", "bank_account_number", "payment_note", "updated_at",
        ]
        read_only_fields = ["updated_at"]

    def validate_business_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("The business name prints at the top of every invoice.")
        return value.strip()

    def validate_bank_bsb(self, value):
        digits = "".join(character for character in value if character.isdigit())
        if value and len(digits) != 6:
            raise serializers.ValidationError("A BSB is six digits.")
        return digits
