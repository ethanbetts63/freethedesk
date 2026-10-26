import pytest
from django.urls import reverse
from freetheplatform.messaging import Suppression, is_suppressed

from outreach.tests.factories import ProspectFactory
from outreach.utils.unsubscribe import unsubscribe_token

pytestmark = pytest.mark.django_db


def test_get_only_checks_the_token(api_client):
    prospect = ProspectFactory()
    url = reverse("outreach-unsubscribe", args=[unsubscribe_token(prospect)])

    response = api_client.get(url)

    assert response.status_code == 200
    assert response.json() == {"valid": True}
    assert not is_suppressed(prospect.email)
    assert prospect.email not in response.content.decode()


def test_post_puts_the_address_on_the_suppression_list(api_client):
    prospect = ProspectFactory(email="sam@thetradieshow.com.au")
    url = reverse("outreach-unsubscribe", args=[unsubscribe_token(prospect)])

    response = api_client.post(url)

    assert response.status_code == 200
    assert response.json() == {"unsubscribed": True}
    assert Suppression.objects.get(address="sam@thetradieshow.com.au").reason == Suppression.Reason.OPTED_OUT
    # Idempotent, and the first reason stays.
    assert api_client.post(url).status_code == 200
    assert Suppression.objects.count() == 1


def test_a_bad_token_is_refused_without_a_hint(api_client):
    prospect = ProspectFactory()
    bad = reverse("outreach-unsubscribe", args=[unsubscribe_token(prospect) + "x"])

    assert api_client.get(bad).status_code == 400
    assert api_client.post(bad).status_code == 400
    assert not is_suppressed(prospect.email)
