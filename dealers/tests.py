from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from core.models import Notification

from .models import Dealer, DealerProfile


class DealerSignupTests(TestCase):
    payload = {
        "business_name": "Perth Motorcycle Centre",
        "contact_name": "Jo Ryan",
        "email": "jo@perthmotorcycles.com.au",
        "phone": "0400 000 000",
        "state": "WA",
        "password": "Sturdy-Passphrase-42",
    }

    def setUp(self):
        cache.clear()

    def test_signup_creates_pending_dealer_and_user(self):
        response = self.client.post(reverse("dealer-signup"), self.payload, content_type="application/json")
        self.assertEqual(response.status_code, 201)

        dealer = Dealer.objects.get()
        self.assertEqual(dealer.status, Dealer.Status.PENDING)
        self.assertEqual(dealer.plan, Dealer.Plan.DEMO)
        self.assertEqual(dealer.payment_status, Dealer.PaymentStatus.DEMO)
        self.assertEqual(dealer.business_name, "Perth Motorcycle Centre")
        self.assertFalse(dealer.user.is_staff)
        self.assertTrue(dealer.user.check_password("Sturdy-Passphrase-42"))

    def test_paid_plan_starts_payment_pending(self):
        response = self.client.post(
            reverse("dealer-signup"),
            {**self.payload, "plan": Dealer.Plan.COMPLETE},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        dealer = Dealer.objects.get()
        self.assertEqual(dealer.plan, Dealer.Plan.COMPLETE)
        self.assertEqual(dealer.payment_status, Dealer.PaymentStatus.PAYMENT_PENDING)

    def test_signup_rejects_unknown_plan(self):
        response = self.client.post(
            reverse("dealer-signup"),
            {**self.payload, "plan": "everything-for-free"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertFalse(Dealer.objects.exists())

    def test_signup_requires_state(self):
        payload = {key: value for key, value in self.payload.items() if key != "state"}
        response = self.client.post(reverse("dealer-signup"), payload, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertFalse(Dealer.objects.exists())

    def test_signup_records_staff_and_dealer_notifications(self):
        self.client.post(reverse("dealer-signup"), self.payload, content_type="application/json")

        dealer = Dealer.objects.get()
        self.assertEqual(dealer.notifications.count(), 3)
        self.assertTrue(dealer.notifications.filter(recipient_type=Notification.RecipientType.DEALER).exists())
        self.assertEqual(
            dealer.notifications.filter(recipient_type=Notification.RecipientType.ADMIN).count(), 2
        )

    def test_signup_rejects_duplicate_email(self):
        get_user_model().objects.create_user(username="existing", email=self.payload["email"], password="x")
        response = self.client.post(reverse("dealer-signup"), self.payload, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertFalse(Dealer.objects.exists())

    def test_signup_rejects_weak_password(self):
        response = self.client.post(
            reverse("dealer-signup"),
            {**self.payload, "password": "password"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertFalse(Dealer.objects.exists())

    def test_honeypot_is_silently_accepted(self):
        response = self.client.post(
            reverse("dealer-signup"),
            {**self.payload, "company_website": "https://spam.example"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertFalse(Dealer.objects.exists())


class DealerPortalTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="d@example.com", email="d@example.com", password="Sturdy-Passphrase-42"
        )
        self.dealer = Dealer.objects.create(
            user=self.user, business_name="Bikes WA", contact_name="Sam Lee",
            email="d@example.com", phone="0400 111 222",
        )

    def test_login_returns_dealer_principal(self):
        response = self.client.post(
            reverse("token"),
            {"username": "d@example.com", "password": "Sturdy-Passphrase-42"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["role"], "dealer")
        self.assertFalse(payload["is_staff"])
        self.assertEqual(payload["dealer"]["business_name"], "Bikes WA")
        self.assertEqual(payload["dealer"]["status"], "pending")

    def test_pending_dealer_may_still_sign_in(self):
        self.assertEqual(self.dealer.status, Dealer.Status.PENDING)
        response = self.client.post(
            reverse("token"),
            {"username": "d@example.com", "password": "Sturdy-Passphrase-42"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)

    def test_user_without_a_portal_is_refused(self):
        get_user_model().objects.create_user(username="nobody@example.com", email="nobody@example.com", password="Sturdy-Passphrase-42")
        response = self.client.post(
            reverse("token"),
            {"username": "nobody@example.com", "password": "Sturdy-Passphrase-42"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)

    def test_dealer_can_read_and_update_own_account(self):
        self.client.force_login(self.user)
        self.assertEqual(self.client.get(reverse("dealer-profile")).json()["business_name"], "Bikes WA")

        response = self.client.patch(
            reverse("dealer-profile"),
            {"business_name": "Bikes WA Pty Ltd", "phone": "0400 333 444"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.dealer.refresh_from_db()
        self.assertEqual(self.dealer.business_name, "Bikes WA Pty Ltd")
        self.assertEqual(self.dealer.phone, "0400 333 444")

    def test_dealer_cannot_change_own_status_or_email(self):
        self.client.force_login(self.user)
        self.client.patch(
            reverse("dealer-profile"),
            {"status": "active", "email": "someone@else.com"},
            content_type="application/json",
        )
        self.dealer.refresh_from_db()
        self.assertEqual(self.dealer.status, Dealer.Status.PENDING)
        self.assertEqual(self.dealer.email, "d@example.com")

    def test_staff_cannot_use_the_dealer_profile_endpoint(self):
        staff = get_user_model().objects.create_user(
            username="staff", email="staff@freethedesk.com.au", password="x", is_staff=True
        )
        self.client.force_login(staff)
        self.assertEqual(self.client.get(reverse("dealer-profile")).status_code, 403)

    def test_dealer_cannot_reach_staff_endpoints(self):
        self.client.force_login(self.user)
        self.assertEqual(self.client.get(reverse("admin-dealer-list")).status_code, 403)

    def test_onboarding_requires_active_payment(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse("dealer-onboarding"))
        self.assertEqual(response.status_code, 403)

    def test_paid_dealer_can_save_onboarding_draft(self):
        self.dealer.plan = Dealer.Plan.COMPLETE
        self.dealer.payment_status = Dealer.PaymentStatus.ACTIVE
        self.dealer.save()
        self.client.force_login(self.user)
        response = self.client.patch(
            reverse("dealer-onboarding"),
            {"legal_name": "Bikes WA Pty Ltd", "trading_name": "Bikes WA"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        profile = DealerProfile.objects.get(dealer=self.dealer)
        self.assertEqual(profile.legal_name, "Bikes WA Pty Ltd")
        self.assertEqual(profile.verification_status, DealerProfile.VerificationStatus.IN_PROGRESS)

    def test_onboarding_rejects_a_file_disguised_by_its_extension(self):
        self.dealer.plan = Dealer.Plan.COMPLETE
        self.dealer.payment_status = Dealer.PaymentStatus.ACTIVE
        self.dealer.save()
        self.client.force_login(self.user)
        api_client = APIClient()
        api_client.force_authenticate(user=self.user)
        response = api_client.patch(
            reverse("dealer-onboarding"),
            {"dealer_licence_document": SimpleUploadedFile(
                "licence.png", b"<script>not an image</script>", content_type="image/png"
            )},
            format="multipart",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("dealer_licence_document", response.json())


class AdminDealerViewTests(TestCase):
    def setUp(self):
        self.staff = get_user_model().objects.create_user(
            username="staff", email="staff@freethedesk.com.au", password="x", is_staff=True
        )
        user = get_user_model().objects.create_user(username="d@example.com", email="d@example.com", password="x")
        self.dealer = Dealer.objects.create(
            user=user, business_name="Bikes WA", contact_name="Sam Lee", email="d@example.com"
        )

    def test_list_requires_staff(self):
        self.assertEqual(self.client.get(reverse("admin-dealer-list")).status_code, 401)

    def test_staff_can_list_dealers(self):
        self.client.force_login(self.staff)
        response = self.client.get(reverse("admin-dealer-list"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["results"][0]["business_name"], "Bikes WA")

    def test_approving_stamps_status_changed_at(self):
        self.client.force_login(self.staff)
        response = self.client.patch(
            reverse("admin-dealer-detail", args=[self.dealer.pk]),
            {"status": "active"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.dealer.refresh_from_db()
        self.assertEqual(self.dealer.status, Dealer.Status.ACTIVE)
        self.assertIsNotNone(self.dealer.status_changed_at)
