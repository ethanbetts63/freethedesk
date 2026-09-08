from decimal import Decimal

import factory

from payments.models import SeoSubscriptionTermsAcceptance
from payments.utils.seo_services import current_seo_terms_sha256
from seo.tests.factories import SeoSubscriberFactory


class SeoSubscriptionTermsAcceptanceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SeoSubscriptionTermsAcceptance

    subscriber = factory.SubFactory(SeoSubscriberFactory)
    accepted_by = factory.LazyAttribute(lambda obj: obj.subscriber.user)
    plan = factory.LazyAttribute(lambda obj: obj.subscriber.plan)
    report_type = factory.LazyAttribute(lambda obj: obj.subscriber.report_type)
    price = Decimal("150.00")
    currency = "AUD"
    terms_version = "2026-09-07"
    terms_sha256 = factory.LazyFunction(current_seo_terms_sha256)
