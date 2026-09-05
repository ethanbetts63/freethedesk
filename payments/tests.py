from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse

from dealers.models import Dealer, DealerProfile


@override_settings(
    STRIPE_SECRET_KEY="sk_test_placeholder",
    STRIPE_WEBHOOK_SECRET="whsec_placeholder",
    STRIPE_PRICE_LICENSING="price_licensing",
    STRIPE_PRICE_CONTRACTS="price_contracts",
    STRIPE_PRICE_COMPLETE="price_complete",
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
    def test_checkout_uses_server_side_price_and_saves_stripe_ids(self, customer_create, session_create):
        customer_create.return_value = Mock(id="cus_test")
        session_create.return_value = Mock(id="cs_test", client_secret="cs_test_secret")

        response = self.client.post(reverse("subscription-checkout"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"client_secret": "cs_test_secret"})
        self.dealer.refresh_from_db()
        self.assertEqual(self.dealer.stripe_customer_id, "cus_test")
        self.assertEqual(self.dealer.stripe_checkout_session_id, "cs_test")
        create_kwargs = session_create.call_args.kwargs
        self.assertEqual(create_kwargs["mode"], "subscription")
        self.assertEqual(create_kwargs["ui_mode"], "elements")
        self.assertEqual(create_kwargs["line_items"], [{"price": "price_complete", "quantity": 1}])

    def test_demo_account_does_not_create_checkout(self):
        self.dealer.plan = Dealer.Plan.DEMO
        self.dealer.payment_status = Dealer.PaymentStatus.DEMO
        self.dealer.save()
        response = self.client.post(reverse("subscription-checkout"))
        self.assertEqual(response.status_code, 400)

    def test_terms_acceptance_is_versioned_on_dealer(self):
        response = self.client.post(
            reverse("subscription-terms-acceptance"),
            {"accepted": True},
            content_type="application/json",
            HTTP_X_FORWARDED_FOR="203.0.113.8",
        )
        self.assertEqual(response.status_code, 200)
        self.dealer.refresh_from_db()
        self.assertEqual(self.dealer.subscription_terms_version, "2026-09-05")
        self.assertEqual(self.dealer.subscription_terms_accepted_ip, "203.0.113.8")
        self.assertIsNotNone(self.dealer.subscription_terms_accepted_at)

    def test_terms_acceptance_requires_explicit_boolean(self):
        response = self.client.post(
            reverse("subscription-terms-acceptance"),
            {"accepted": "true"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    @patch("payments.views.stripe.Webhook.construct_event")
    def test_subscription_webhook_activates_dealer_and_creates_profile(self, construct_event):
        construct_event.return_value = {
            "type": "customer.subscription.updated",
            "data": {"object": {
                "id": "sub_test",
                "customer": "cus_test",
                "status": "active",
                "current_period_end": 1798761600,
                "cancel_at_period_end": False,
                "metadata": {"dealer_id": str(self.dealer.pk)},
            }},
        }
        response = self.client.post(
            reverse("stripe-webhook"), data=b"{}", content_type="application/json",
            HTTP_STRIPE_SIGNATURE="test-signature",
        )
        self.assertEqual(response.status_code, 200)
        self.dealer.refresh_from_db()
        self.assertEqual(self.dealer.payment_status, Dealer.PaymentStatus.ACTIVE)
        self.assertEqual(self.dealer.stripe_subscription_id, "sub_test")
        self.assertTrue(DealerProfile.objects.filter(dealer=self.dealer).exists())

    @patch("payments.views.stripe.Webhook.construct_event")
    def test_invalid_webhook_signature_is_rejected(self, construct_event):
        import stripe

        construct_event.side_effect = stripe.SignatureVerificationError("bad", "sig")
        response = self.client.post(
            reverse("stripe-webhook"), data=b"{}", content_type="application/json",
            HTTP_STRIPE_SIGNATURE="bad",
        )
        self.assertEqual(response.status_code, 400)
