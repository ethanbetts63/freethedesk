from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from django.db.models import Q
from rest_framework import serializers


class BaseAccountRegistrationSerializer(serializers.Serializer):
    """Shared public-signup logic for the dealer and SEO products.

    Subclasses set ``tenant_model`` / ``tenant_defaults`` and declare their own
    extra fields (state, website, plan choices). Email/password validation, user
    creation, the ``username == email`` convention and the duplicate-signup race
    all live here so the two flows can't drift apart.
    """

    tenant_model = None
    tenant_defaults: dict = {}

    business_name = serializers.CharField(max_length=180)
    contact_name = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=40, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    default_error_messages = {
        "email_taken": "An account already exists for this email address.",
    }

    def validate_email(self, value: str) -> str:
        value = value.strip().lower()
        # Signup accounts use username == email, so the username column carries
        # the real DB uniqueness — check both.
        exists = get_user_model().objects.filter(
            Q(email__iexact=value) | Q(username__iexact=value[:150])
        ).exists()
        if exists:
            self.fail("email_taken")
        return value

    def validate_password(self, value: str) -> str:
        try:
            validate_password(value)
        except DjangoValidationError as error:
            raise serializers.ValidationError(list(error.messages)) from error
        return value

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop("password")
        email = validated_data.pop("email")
        try:
            user = get_user_model().objects.create_user(
                # Customers never see or type a separate username, and it keeps
                # the login form single-field.
                username=email[:150],
                email=email,
                password=password,
                is_staff=False,
            )
            return self.tenant_model.objects.create(
                user=user, **self.tenant_defaults, **validated_data
            )
        except IntegrityError as error:
            # Lost the race between validate_email and the unique constraint.
            raise serializers.ValidationError(
                {"email": [self.error_messages["email_taken"]]}
            ) from error
