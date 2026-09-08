import pytest

from core.tests.factories import UserFactory
from seo.models import SeoSubscriber
from seo.tests.factories import SeoSubscriberFactory


@pytest.fixture
def seo_subscriber():
    user = UserFactory(username="s@example.com")
    return SeoSubscriberFactory(
        user=user, business_name="Peak Digital", contact_name="Sam Lee", phone="0400 111 222",
    )


@pytest.fixture
def paid_seo_subscriber(seo_subscriber):
    seo_subscriber.payment_status = SeoSubscriber.PaymentStatus.ACTIVE
    seo_subscriber.save(update_fields=["payment_status"])
    return seo_subscriber


@pytest.fixture
def staff_user():
    return UserFactory(username="staff", email="staff@freethedesk.com.au", is_staff=True)
