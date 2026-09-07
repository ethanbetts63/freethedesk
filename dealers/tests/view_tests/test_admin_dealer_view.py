import pytest
from django.urls import reverse

from dealers.models import Dealer

pytestmark = pytest.mark.django_db


def test_list_requires_staff(client, dealer):
    assert client.get(reverse("admin-dealer-list")).status_code == 401


def test_staff_can_list_dealers(client, dealer, staff_user):
    client.force_login(staff_user)
    response = client.get(reverse("admin-dealer-list"))
    assert response.status_code == 200
    assert response.json()["results"][0]["business_name"] == "Bikes WA"


def test_approving_stamps_status_changed_at(client, dealer, staff_user):
    client.force_login(staff_user)
    response = client.patch(
        reverse("admin-dealer-detail", args=[dealer.pk]),
        {"status": "active"},
        content_type="application/json",
    )
    assert response.status_code == 200
    dealer.refresh_from_db()
    assert dealer.status == Dealer.Status.ACTIVE
    assert dealer.status_changed_at is not None
