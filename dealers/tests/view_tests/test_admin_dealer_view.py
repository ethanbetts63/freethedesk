import pytest
from django.urls import reverse

from core.tests.factories import UserFactory
from dealers.models import Dealer
from dealers.tests.factories import DealerFactory

pytestmark = pytest.mark.django_db


@pytest.fixture
def dealer():
    user = UserFactory(username="d@example.com")
    return DealerFactory(user=user, business_name="Bikes WA", contact_name="Sam Lee", email="d@example.com")


def test_list_requires_staff(client, dealer):
    assert client.get(reverse("admin-dealer-list")).status_code == 401


def test_staff_can_list_dealers(client, dealer):
    staff = UserFactory(username="staff", email="staff@freethedesk.com.au", is_staff=True)
    client.force_login(staff)
    response = client.get(reverse("admin-dealer-list"))
    assert response.status_code == 200
    assert response.json()["results"][0]["business_name"] == "Bikes WA"


def test_approving_stamps_status_changed_at(client, dealer):
    staff = UserFactory(username="staff", email="staff@freethedesk.com.au", is_staff=True)
    client.force_login(staff)
    response = client.patch(
        reverse("admin-dealer-detail", args=[dealer.pk]),
        {"status": "active"},
        content_type="application/json",
    )
    assert response.status_code == 200
    dealer.refresh_from_db()
    assert dealer.status == Dealer.Status.ACTIVE
    assert dealer.status_changed_at is not None
