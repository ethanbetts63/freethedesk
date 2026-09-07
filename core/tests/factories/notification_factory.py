import factory

from core.models import Notification


class NotificationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Notification

    recipient_type = Notification.RecipientType.MANUAL
    recipient = factory.Faker("email")
    channel = Notification.Channel.EMAIL
    subject = factory.Faker("sentence")
    body = factory.Faker("paragraph")
