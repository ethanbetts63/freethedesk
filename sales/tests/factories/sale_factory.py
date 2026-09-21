import factory

from dealers.tests.factories import DealerFactory
from sales.models import Sale


class SaleFactory(factory.django.DjangoModelFactory):
    """Builds sales through the unrestricted manager.

    factory_boy writes through the model's default manager, which on a
    tenant-owned model refuses every query. The dealer is passed explicitly on
    every build here, so there is nothing for the guard to catch.
    """

    class Meta:
        model = Sale

    @classmethod
    def _get_manager(cls, model_class):
        return model_class.all_objects

    dealer = factory.SubFactory(DealerFactory)
    produces = Sale.Produces.COMPLETE
    condition = Sale.Condition.USED
    make = "Honda"
    model_name = "CB125F"
    year = 2021
    odometer_km = 12000
    vehicle_price = 4500
    customer_name = "Alex Tran"
    customer_email = factory.Sequence(lambda n: f"customer{n}@example.com")
    customer_phone = "0400 222 333"
