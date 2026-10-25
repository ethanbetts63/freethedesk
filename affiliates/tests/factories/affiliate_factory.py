import factory
from django.utils import timezone

from affiliates.models import Affiliate
from affiliates.utils.codes import create_affiliate_discount
from core.tests.factories import UserFactory


class AffiliateFactory(factory.django.DjangoModelFactory):
    """An active affiliate with a code, as sign-up leaves one (without the free audit)."""

    class Meta:
        model = Affiliate

    user = factory.SubFactory(UserFactory)
    email = factory.LazyAttribute(lambda o: o.user.email)
    contact_name = "Sam Host"
    business_name = "The Tradie Show"
    website = "https://www.thetradieshow.com.au"
    status = Affiliate.Status.ACTIVE
    status_changed_at = factory.LazyFunction(timezone.now)

    @factory.post_generation
    def discount(obj, create, extracted, **kwargs):
        if not create:
            return
        obj.discount = extracted or create_affiliate_discount(obj)
        obj.save(update_fields=["discount"])
