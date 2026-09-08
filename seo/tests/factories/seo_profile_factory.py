import factory

from seo.models import SeoProfile

from .seo_subscriber_factory import SeoSubscriberFactory


class SeoProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SeoProfile

    subscriber = factory.SubFactory(SeoSubscriberFactory)
