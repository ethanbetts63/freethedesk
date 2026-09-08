import pytest
from django.test import override_settings

from dealers.models import Dealer
from dealers.tests.factories import DealerFactory
from seo.models import SeoSubscriber
from seo.tests.factories import SeoSubscriberFactory

stripe_settings = override_settings(
    STRIPE_SECRET_KEY="sk_test_placeholder",
    STRIPE_WEBHOOK_SECRET="whsec_placeholder",
)


@pytest.fixture
def dealer():
    return DealerFactory(
        user__email="dealer@example.com",
        business_name="Example Motorcycles",
        contact_name="Alex Dealer",
        plan=Dealer.Plan.COMPLETE,
        payment_status=Dealer.PaymentStatus.PAYMENT_PENDING,
    )


@pytest.fixture
def logged_in_dealer(client, dealer):
    client.force_login(dealer.user)
    return dealer


@pytest.fixture
def seo_subscriber():
    return SeoSubscriberFactory(
        user__email="seo@example.com",
        business_name="Peak Digital",
        contact_name="Sam Lee",
        plan=SeoSubscriber.Plan.QUARTERLY,
        payment_status=SeoSubscriber.PaymentStatus.PAYMENT_PENDING,
    )


@pytest.fixture
def logged_in_seo_subscriber(client, seo_subscriber):
    client.force_login(seo_subscriber.user)
    return seo_subscriber
