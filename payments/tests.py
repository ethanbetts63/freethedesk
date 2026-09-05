from decimal import Decimal
from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse

from core.models import LicensingSettings
from dealers.models import Dealer, DealerProfile

from .models import DealerSubscriptionTermsAcceptance, StripeEvent
from .services import current_terms_sha256


@override_settings(
    STRIPE_SECRET_KEY="sk_test_placeholder",
    STRIPE_WEBHOOK_SECRET="whsec_placeholder",
)
class SubscriptionCheckoutTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="dealer@example.com", email="dealer@example.com", password="Strong-passphrase-42"
        )
        self.dealer = Dealer.objects.create(
            user=self.user,
            business_name="Example Motorcycles",
            contact_name="Alex Dealer",
            email="dealer@example.com",
            plan=Dealer.Plan.COMPLETE,
            payment_status=Dealer.PaymentStatus.PAYMENT_PENDING,
        )
        self.client.force_login(self.user)

    @patch("payments.services.stripe.checkout.Session.create")
    @patch("payments.services.stripe.Customer.create")
    def test_checkout_uses_backend_price_and_records_terms(self, customer_create, session_create):
        LicensingSettings.load()
        settings = LicensingSettings.load()
        settings.complete_price = Decimal("219.50")
        settings.save()
        customer_create.return_value = Mock(id="cus_test")
        session_create.return_value = Mock(id="cs_test", client_secret="cs_test_secret")

        response = self.client.post(
            reverse("subscription-checkout"),
            {"accepted_terms": True},
            content_type="application/json",
            HTTP_X_FORWARDED_FOR="203.0.113.99, 198.51.100.24",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["monthly_price"], "219.50")
        create_kwargs = session_create.call_args.kwargs
        price_data = create_kwargs["line_items"][0]["price_data"]
        self.assertEqual(price_data["unit_amount"], 21950)
        self.assertEqual(price_data["currency"], "aud")
        self.assertEqual(price_data["tax_behavior"], "inclusive")
        self.assertEqual(price_data["recurring"], {"interval": "month"})
        acceptance = DealerSubscriptionTermsAcceptance.objects.get()
        self.assertEqual(acceptance.monthly_price, Decimal("219.50"))
        self.assertEqual(str(acceptance.accepted_ip), "198.51.100.24")
        self.assertEqual(acceptance.stripe_checkout_session_id, "cs_test")
        self.assertEqual(create_kwargs["metadata"]["terms_acceptance_id"], str(acceptance.pk))

    def test_checkout_requires_terms_acceptance(self):
        response = self.client.post(reverse("subscription-checkout"), {}, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertFalse(DealerSubscriptionTermsAcceptance.objects.exists())

    def test_demo_account_does_not_create_checkout(self):
        self.dealer.plan = Dealer.Plan.DEMO
        self.dealer.payment_status = Dealer.PaymentStatus.DEMO
        self.dealer.save()
        response = self.client.post(
            reverse("subscription-checkout"),
            {"accepted_terms": True},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    @patch("payments.services.stripe.checkout.Session.create")
    @patch("payments.services.stripe.Customer.create")
    def test_repeated_checkout_reuses_same_offer_acceptance(self, customer_create, session_create):
        customer_create.return_value = Mock(id="cus_test")
        session_create.return_value = Mock(id="cs_test", client_secret="cs_test_secret")
        payload = {"accepted_terms": True}
        self.client.post(reverse("subscription-checkout"), payload, content_type="application/json")

        with patch("payments.services.stripe.checkout.Session.retrieve") as retrieve:
            retrieve.return_value = {
                "id": "cs_test",
                "status": "open",
                "client_secret": "cs_test_secret",
                "metadata": {"terms_acceptance_id": str(DealerSubscriptionTermsAcceptance.objects.get().pk)},
            }
            response = self.client.post(
                reverse("subscription-checkout"), payload, content_type="application/json"
            )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(DealerSubscriptionTermsAcceptance.objects.count(), 1)

    def _acceptance(self):
        return DealerSubscriptionTermsAcceptance.objects.create(
            dealer=self.dealer,
            accepted_by=self.user,
            plan=self.dealer.plan,
            monthly_price=Decimal("199.00"),
            currency="AUD",
            terms_version="2026-09-05",
            terms_sha256=current_terms_sha256(),
            stripe_checkout_session_id="cs_test",
        )

    @patch("payments.views.stripe.Webhook.construct_event")
    def test_subscription_webhook_is_idempotent_and_activates_dealer(self, construct_event):
        acceptance = self._acceptance()
        construct_event.return_value = {
            "id": "evt_active",
            "created": 1798761600,
            "type": "customer.subscription.updated",
            "data": {"object": {
                "id": "sub_test",
                "customer": "cus_test",
                "status": "active",
                "current_period_end": 1801440000,
                "cancel_at_period_end": False,
                "metadata": {
                    "dealer_id": str(self.dealer.pk),
                    "terms_acceptance_id": str(acceptance.pk),
                },
            }},
        }
        first = self.client.post(
            reverse("stripe-webhook"), data=b"{}", content_type="application/json",
            HTTP_STRIPE_SIGNATURE="test-signature",
        )
        second = self.client.post(
            reverse("stripe-webhook"), data=b"{}", content_type="application/json",
            HTTP_STRIPE_SIGNATURE="test-signature",
        )
        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.json()["outcome"], "duplicate")
        self.dealer.refresh_from_db()
        self.assertEqual(self.dealer.payment_status, Dealer.PaymentStatus.ACTIVE)
        self.assertEqual(self.dealer.stripe_subscription_id, "sub_test")
        self.assertTrue(DealerProfile.objects.filter(dealer=self.dealer).exists())
        self.assertEqual(StripeEvent.objects.count(), 1)

    @patch("payments.views.stripe.Webhook.construct_event")
    def test_stale_subscription_event_cannot_regress_status(self, construct_event):
        acceptance = self._acceptance()
        self.dealer.stripe_subscription_id = "sub_test"
        self.dealer.payment_status = Dealer.PaymentStatus.ACTIVE
        from datetime import datetime, timezone
        self.dealer.stripe_last_event_created_at = datetime.fromtimestamp(200, tz=timezone.utc)
        self.dealer.save()
        construct_event.return_value = {
            "id": "evt_stale",
            "created": 100,
            "type": "customer.subscription.updated",
            "data": {"object": {
                "id": "sub_test", "customer": "cus_test", "status": "past_due",
                "metadata": {"dealer_id": str(self.dealer.pk), "terms_acceptance_id": str(acceptance.pk)},
            }},
        }
        response = self.client.post(
            reverse("stripe-webhook"), data=b"{}", content_type="application/json",
            HTTP_STRIPE_SIGNATURE="test-signature",
        )
        self.assertEqual(response.json()["outcome"], "ignored: stale subscription event")
        self.dealer.refresh_from_db()
        self.assertEqual(self.dealer.payment_status, Dealer.PaymentStatus.ACTIVE)

    @patch("payments.views.stripe.Webhook.construct_event")
    def test_invalid_webhook_signature_is_rejected(self, construct_event):
        import stripe

        construct_event.side_effect = stripe.SignatureVerificationError("bad", "sig")
        response = self.client.post(
            reverse("stripe-webhook"), data=b"{}", content_type="application/json",
            HTTP_STRIPE_SIGNATURE="bad",
        )
        self.assertEqual(response.status_code, 400)
