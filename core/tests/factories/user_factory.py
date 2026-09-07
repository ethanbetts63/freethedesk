import factory
from django.contrib.auth import get_user_model


class UserFactory(factory.django.DjangoModelFactory):
    """Shared across apps — import this rather than duplicating a user factory."""

    class Meta:
        model = get_user_model()
        django_get_or_create = ("username",)

    username = factory.Sequence(lambda n: f"user{n}@example.com")
    email = factory.LazyAttribute(lambda obj: obj.username)
    password = factory.PostGenerationMethodCall("set_password", "Sturdy-Passphrase-42")
    is_staff = False
