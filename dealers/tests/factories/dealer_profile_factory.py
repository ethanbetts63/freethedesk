import factory

from dealers.models import DealerProfile

from .dealer_factory import DealerFactory


class DealerProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = DealerProfile

    dealer = factory.SubFactory(DealerFactory)
