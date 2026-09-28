"""The staff users API as this site wires it.

The endpoints and their guards are freetheplatform's and tested there. What is
ours is the directory — roles matching `core.principal`, sales read across
dealers by account — and the notice an owner gets when staff set their password.
"""

import pytest
from freetheplatform.messaging.models import Message
from rest_framework.test import APIClient

from core.tests.factories import UserFactory
from core.tests.factories.enquiry_factory import EnquiryFactory
from dealers.tests.factories.dealer_factory import DealerFactory
from sales.tests.factories.sale_factory import SaleFactory
from seo.tests.factories.seo_subscriber_factory import SeoSubscriberFactory

BASE = "/api/admin/users/"
NEW_PASSWORD = "a-long-new-passphrase"


@pytest.fixture
def client(staff_user):
    client = APIClient()
    client.force_authenticate(staff_user)
    return client


def usernames(response):
    return {row["username"] for row in response.data["results"]}


@pytest.mark.django_db
class TestRoles:
    def test_non_staff_are_refused(self):
        client = APIClient()
        client.force_authenticate(UserFactory())
        assert client.get(BASE).status_code == 403

    def test_each_role_filters_to_its_own(self, client, staff_user):
        dealership = DealerFactory()
        dealer = dealership.user
        seo = SeoSubscriberFactory().user
        customer = UserFactory()
        SaleFactory(account=customer, dealer=dealership)
        nobody = UserFactory()

        assert usernames(client.get(BASE, {"role": "staff"})) == {staff_user.username}
        assert usernames(client.get(BASE, {"role": "dealer"})) == {dealer.username}
        assert usernames(client.get(BASE, {"role": "seo"})) == {seo.username}
        assert usernames(client.get(BASE, {"role": "customer"})) == {customer.username}
        assert nobody.username in usernames(client.get(BASE, {"role": "none"}))

    def test_the_row_carries_the_same_role(self, client):
        dealer = DealerFactory().user

        rows = {row["username"]: row for row in client.get(BASE).data["results"]}

        assert rows[dealer.username]["role"] == "dealer"


@pytest.mark.django_db
class TestActivity:
    def test_sales_cross_dealers_and_enquiries_match_on_email(self, client):
        customer = UserFactory(email="rider@example.com")
        first = SaleFactory(account=customer)
        second = SaleFactory(account=customer)
        EnquiryFactory(email="RIDER@example.com")
        EnquiryFactory(email="someone@example.com")

        sections = {s["key"]: s for s in client.get(f"{BASE}{customer.pk}/").data["activity"]}

        assert first.dealer_id != second.dealer_id
        assert {row["reference"] for row in sections["sales"]["rows"]} == {
            first.reference,
            second.reference,
        }
        assert sections["enquiries"]["total"] == 1

    def test_a_dealer_links_to_its_admin_page(self, client):
        dealer = DealerFactory()

        sections = {s["key"]: s for s in client.get(f"{BASE}{dealer.user.pk}/").data["activity"]}

        assert sections["dealer"]["rows"][0]["href"] == f"/dashboard/admin/dealers/{dealer.pk}"


@pytest.mark.django_db
class TestPasswordSet:
    def test_the_owner_is_told_without_the_password(self, client):
        user = UserFactory(email="rider@example.com")

        response = client.post(f"{BASE}{user.pk}/password/", {"new_password": NEW_PASSWORD})

        assert response.status_code == 200
        notice = Message.objects.get(message_type="auth.password_set")
        assert notice.to == "rider@example.com"
        assert NEW_PASSWORD not in (notice.body_text or "")
