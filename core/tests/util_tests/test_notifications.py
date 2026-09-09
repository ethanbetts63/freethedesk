from unittest.mock import patch

import pytest
from django.test import override_settings

from core.tests.factories import NotificationFactory
from core.utils.notifications import send_notification

pytestmark = pytest.mark.django_db


@override_settings(
    NOTIFICATIONS_ENABLED=True,
    MAILGUN_API_KEY="test-key",
    MAILGUN_DOMAIN="mail.example.com",
    DEFAULT_FROM_EMAIL="freethedesk <hello@example.com>",
)
@patch("core.utils.notifications.requests.post")
def test_email_delivery_is_marked_sent(post):
    post.return_value.raise_for_status.return_value = None
    notification = NotificationFactory(
        recipient_type="manual",
        recipient="lead@example.com",
        channel="email",
        subject="Hello",
        body="A message from freethedesk.",
    )
    send_notification(notification)
    notification.refresh_from_db()
    assert notification.status == "sent"
    assert notification.sent_at is not None


@override_settings(
    NOTIFICATIONS_ENABLED=True,
    TWILIO_ACCOUNT_SID="ACtest",
    TWILIO_AUTH_TOKEN="test-token",
    TWILIO_MESSAGING_SERVICE_SID="MGtest",
    TWILIO_PHONE_NUMBER="",
)
@patch("twilio.rest.Client")
def test_sms_delivery_is_marked_sent(client):
    notification = NotificationFactory(
        recipient_type="admin",
        recipient="+61400000000",
        channel="sms",
        body="New enquiry received.",
    )
    send_notification(notification)
    notification.refresh_from_db()
    assert notification.status == "sent"
    client.return_value.messages.create.assert_called_once()
