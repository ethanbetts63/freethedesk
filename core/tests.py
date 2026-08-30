from django.test import TestCase
from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework.test import APIClient
from unittest.mock import patch

from .models import Enquiry, Notification
from .notifications import send_notification


class CoreApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_check(self):
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_enquiry_can_be_created(self):
        response = self.client.post(
            "/api/enquiries/",
            {
                "name": "Jane Dealer",
                "business": "Example Equipment",
                "email": "jane@example.com",
                "phone": "0400 000 000",
                "website": "https://example.com",
                "help_with": "website",
                "message": "Our inventory and parts enquiries need a better system.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Enquiry.objects.count(), 1)
        self.assertEqual(Enquiry.objects.get().business, "Example Equipment")
        self.assertEqual(Notification.objects.count(), 2)
        self.assertEqual(
            set(Notification.objects.values_list("channel", flat=True)),
            {"email", "sms"},
        )

    def test_short_enquiry_message_is_rejected(self):
        response = self.client.post(
            "/api/enquiries/",
            {
                "name": "Jane Dealer",
                "business": "Example Equipment",
                "email": "jane@example.com",
                "help_with": "automation",
                "message": "Help",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(Enquiry.objects.count(), 0)

    def test_all_of_the_above_is_a_valid_enquiry_type(self):
        response = self.client.post(
            "/api/enquiries/",
            {
                "name": "Sam Dealer",
                "business": "Complete Dealer Group",
                "email": "sam@example.com",
                "help_with": "everything",
                "message": "We need the website and our internal workflows improved.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Enquiry.objects.get().help_with, "everything")

    def test_honeypot_submission_is_quietly_discarded(self):
        response = self.client.post(
            "/api/enquiries/",
            {
                "name": "Automated Sender",
                "business": "Spam Company",
                "email": "spam@example.com",
                "help_with": "website",
                "message": "This looks real but the honeypot was completed.",
                "company_website": "https://spam.example.com",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Enquiry.objects.count(), 0)


class AdminApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff = get_user_model().objects.create_user(
            username="admin",
            email="admin@example.com",
            password="test-password-123",
            is_staff=True,
        )
        self.enquiry = Enquiry.objects.create(
            name="Alex Smith",
            business="Example Marine",
            email="alex@example.com",
            help_with="everything",
            message="We need a faster website and a better enquiry workflow.",
        )

    def test_enquiry_dashboard_requires_staff(self):
        response = self.client.get("/api/admin/enquiries/")
        self.assertEqual(response.status_code, 401)

    def test_staff_can_list_and_update_enquiries(self):
        self.client.force_authenticate(self.staff)
        response = self.client.get("/api/admin/enquiries/?status=new")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["count"], 1)

        response = self.client.patch(
            f"/api/admin/enquiries/{self.enquiry.pk}/",
            {"status": "contacted"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.enquiry.refresh_from_db()
        self.assertEqual(self.enquiry.status, "contacted")

    def test_staff_login_sets_http_only_auth_cookies(self):
        response = self.client.post(
            "/api/token/",
            {"username": "admin", "password": "test-password-123"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.cookies["freethedesk_access"]["httponly"])
        self.assertTrue(response.cookies["freethedesk_refresh"]["httponly"])

    def test_disabled_delivery_records_compose_attempt(self):
        self.client.force_authenticate(self.staff)
        response = self.client.post(
            "/api/admin/messages/compose/",
            {"to": "lead@example.com", "subject": "Hello", "body": "Thanks for your enquiry."},
            format="multipart",
        )
        self.assertEqual(response.status_code, 503)
        notification = Notification.objects.get()
        self.assertEqual(notification.status, "pending")
        self.assertEqual(notification.recipient, "lead@example.com")


class NotificationDeliveryTests(TestCase):
    @override_settings(
        NOTIFICATIONS_ENABLED=True,
        MAILGUN_API_KEY="test-key",
        MAILGUN_DOMAIN="mail.example.com",
        DEFAULT_FROM_EMAIL="Free the Desk <hello@example.com>",
    )
    @patch("core.notifications.requests.post")
    def test_email_delivery_is_marked_sent(self, post):
        post.return_value.raise_for_status.return_value = None
        notification = Notification.objects.create(
            recipient_type="manual",
            recipient="lead@example.com",
            channel="email",
            subject="Hello",
            body="A message from Free the Desk.",
        )
        send_notification(notification)
        notification.refresh_from_db()
        self.assertEqual(notification.status, "sent")
        self.assertIsNotNone(notification.sent_at)

    @override_settings(
        NOTIFICATIONS_ENABLED=True,
        TWILIO_ACCOUNT_SID="ACtest",
        TWILIO_AUTH_TOKEN="test-token",
        TWILIO_MESSAGING_SERVICE_SID="MGtest",
        TWILIO_PHONE_NUMBER="",
    )
    @patch("twilio.rest.Client")
    def test_sms_delivery_is_marked_sent(self, client):
        notification = Notification.objects.create(
            recipient_type="admin",
            recipient="+61400000000",
            channel="sms",
            body="New enquiry received.",
        )
        send_notification(notification)
        notification.refresh_from_db()
        self.assertEqual(notification.status, "sent")
        client.return_value.messages.create.assert_called_once()
