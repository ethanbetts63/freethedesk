from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers


class SeoPasswordSerializer(serializers.Serializer):
    """Validates a first password; the view is what sets it.

    Length and shape are the project's validators, so this never has an opinion
    of its own about either.
    """

    password = serializers.CharField(write_only=True, max_length=128)  # Hashing is expensive; cap the work.

    def validate_password(self, value):
        try:
            validate_password(value, self.context["request"].user)
        except DjangoValidationError as error:
            raise serializers.ValidationError(list(error.messages)) from error
        return value
