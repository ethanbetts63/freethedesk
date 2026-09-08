import factory

from core.tests.factories import UserFactory
from seo.models import SeoSubscriber


class SeoSubscriberFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SeoSubscriber

    user = factory.SubFactory(UserFactory)
    business_name = factory.Faker("company")
    contact_name = factory.Faker("name")
    phone = "0400 000 000"
    website = "https://example.com"
    report_type = SeoSubscriber.ReportType.SEO
    plan = SeoSubscriber.Plan.QUARTERLY
