import factory

from core.models import Enquiry


class EnquiryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Enquiry

    name = factory.Faker("name")
    business = factory.Faker("company")
    email = factory.Faker("email")
    phone = "0400 000 000"
    help_with = Enquiry.HelpWith.EVERYTHING
    message = factory.Faker("paragraph")
    configuration = factory.LazyFunction(dict)
