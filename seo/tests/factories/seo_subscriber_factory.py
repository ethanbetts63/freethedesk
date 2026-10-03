import factory

from core.tests.factories import UserFactory
from seo.models import SeoSubscriber


class SeoSubscriberFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SeoSubscriber

    user = factory.SubFactory(UserFactory)
    # The subscriber's own copy, set at signup; once paid it matches the login's.
    email = factory.LazyAttribute(lambda o: o.user.email if o.user else "signup@example.com")
    business_name = factory.Faker("company")
    contact_name = factory.Faker("name")
    phone = "0400 000 000"
    website = "https://example.com"
    plan = SeoSubscriber.Plan.QUARTERLY
