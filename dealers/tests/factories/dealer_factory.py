import factory

from core.tests.factories import UserFactory
from dealers.models import Dealer


class DealerFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Dealer

    user = factory.SubFactory(UserFactory)
    business_name = factory.Faker("company")
    contact_name = factory.Faker("name")
    phone = "0400 000 000"
    state = Dealer.State.WA
