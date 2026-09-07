import pytest
from django.test import override_settings

from dealers.models import Dealer
from dealers.tests.factories import DealerFactory

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
