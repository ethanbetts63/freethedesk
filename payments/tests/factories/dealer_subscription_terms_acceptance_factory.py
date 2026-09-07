from decimal import Decimal

import factory

from dealers.tests.factories import DealerFactory
from payments.models import DealerSubscriptionTermsAcceptance
from payments.utils.services import current_terms_sha256


class DealerSubscriptionTermsAcceptanceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = DealerSubscriptionTermsAcceptance

    dealer = factory.SubFactory(DealerFactory)
    accepted_by = factory.LazyAttribute(lambda obj: obj.dealer.user)
    plan = factory.LazyAttribute(lambda obj: obj.dealer.plan)
    monthly_price = Decimal("199.00")
    currency = "AUD"
    terms_version = "2026-09-05"
    terms_sha256 = factory.LazyFunction(current_terms_sha256)
