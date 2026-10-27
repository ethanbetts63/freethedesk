import pytest
from django.urls import reverse

from seo.models import SeoSubscriber
from seo.tests.factories import SeoSubscriberFactory

pytestmark = pytest.mark.django_db


def test_a_signup_reads_its_payment_state_by_reference(client):
    signup = SeoSubscriberFactory(user=None, email="jo@peakdigital.com.au")

    response = client.get(reverse("seo-checkout-status", args=[signup.checkout_reference]))

    assert response.status_code == 200
    # Nothing that identifies the person until it is paid: the reference may sit in a URL.
    assert response.json() == {
        "plan": signup.plan,
        "payment_status": SeoSubscriber.PaymentStatus.PAYMENT_PENDING,
        "paid": False,
        "email": "",
    }


def test_a_paid_signup_reads_as_paid_and_names_the_email_for_the_verify_form(client):
    signup = SeoSubscriberFactory(
        user=None, email="jo@peakdigital.com.au", payment_status=SeoSubscriber.PaymentStatus.PAID
    )

    response = client.get(reverse("seo-checkout-status", args=[signup.checkout_reference]))

    assert response.json()["paid"] is True
    assert response.json()["email"] == "jo@peakdigital.com.au"


def test_an_unknown_reference_finds_nothing(client):
    response = client.get(reverse("seo-checkout-status", args=["not-a-real-reference"]))
    assert response.status_code == 404
