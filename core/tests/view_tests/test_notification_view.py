import pytest

from core.models import Notification
from core.tests.factories import UserFactory

pytestmark = pytest.mark.django_db


def test_disabled_delivery_records_compose_attempt(api_client):
    staff = UserFactory(username="admin", is_staff=True)
    api_client.force_authenticate(staff)

    response = api_client.post(
        "/api/admin/messages/compose/",
        {"to": "lead@example.com", "subject": "Hello", "body": "Thanks for your enquiry."},
        format="multipart",
    )
    assert response.status_code == 503
    notification = Notification.objects.get()
    assert notification.status == "pending"
    assert notification.recipient == "lead@example.com"
