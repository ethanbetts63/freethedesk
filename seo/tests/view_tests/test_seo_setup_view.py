import pytest
from django.urls import reverse

from seo.models import SeoProfile, SeoSetupStep, SeoSubscriber
from seo.utils import setup
from seo.utils.google_access import AccessCheckUnavailable

pytestmark = pytest.mark.django_db


def _steps(response):
    return {step["key"]: step for step in response.json()["steps"]}


@pytest.fixture
def google(monkeypatch):
    """Stands in for Google: set ``found`` to what the service account can read."""

    class Fake:
        found = ""
        unavailable = False

        def __call__(self, website):
            if self.unavailable:
                raise AccessCheckUnavailable("no key")
            return self.found

    fake = Fake()
    monkeypatch.setitem(setup.CHECKS, SeoSetupStep.Key.SEARCH_CONSOLE, fake)
    return fake


def test_setup_requires_payment(client, seo_subscriber):
    client.sign_in(seo_subscriber.user)
    assert client.get(reverse("seo-setup")).status_code == 403


def test_setup_lists_every_step_with_only_search_console_required(client, paid_seo_subscriber):
    client.sign_in(paid_seo_subscriber.user)
    response = client.get(reverse("seo-setup"))

    assert response.status_code == 200
    assert [step["key"] for step in response.json()["steps"]] == list(setup.STEP_ORDER)
    assert [key for key, step in _steps(response).items() if step["required"]] == ["search_console"]
    assert response.json()["complete"] is False


def test_marking_a_step_done_asks_staff_to_confirm_it(
    client, paid_seo_subscriber, outbox, django_capture_on_commit_callbacks
):
    client.sign_in(paid_seo_subscriber.user)
    with django_capture_on_commit_callbacks(execute=True):
        response = client.post(
            reverse("seo-setup-mark", args=["google_ads"]), {"done": True},
            content_type="application/json",
        )

    assert _steps(response)["google_ads"]["state"] == "marked_done"
    [alert] = outbox
    assert alert.message_type == "seo.staff_setup_marked"
    assert "Google Ads" in alert.subject


def test_a_marked_step_can_be_unmarked(client, paid_seo_subscriber):
    client.sign_in(paid_seo_subscriber.user)
    url = reverse("seo-setup-mark", args=["clarity"])
    client.post(url, {"done": True}, content_type="application/json")
    response = client.post(url, {"done": False}, content_type="application/json")

    assert _steps(response)["clarity"]["state"] == "not_started"


def test_a_customer_cannot_take_back_a_confirmation(client, paid_seo_subscriber):
    [step] = [s for s in setup.setup_steps(paid_seo_subscriber) if s.key == "clarity"]
    setup.confirm_step(step)
    client.sign_in(paid_seo_subscriber.user)

    response = client.post(
        reverse("seo-setup-mark", args=["clarity"]), {"done": False},
        content_type="application/json",
    )
    assert _steps(response)["clarity"]["state"] == "confirmed"


def test_marking_needs_a_boolean(client, paid_seo_subscriber):
    client.sign_in(paid_seo_subscriber.user)
    response = client.post(
        reverse("seo-setup-mark", args=["clarity"]), {"done": "yes"},
        content_type="application/json",
    )
    assert response.status_code == 400


def test_an_unknown_step_is_not_found(client, paid_seo_subscriber):
    client.sign_in(paid_seo_subscriber.user)
    response = client.post(
        reverse("seo-setup-mark", args=["myspace"]), {"done": True},
        content_type="application/json",
    )
    assert response.status_code == 404


def test_a_passing_search_console_check_confirms_and_starts_reporting(
    client, paid_seo_subscriber, google, outbox, django_capture_on_commit_callbacks
):
    google.found = "sc-domain:example.com"
    client.sign_in(paid_seo_subscriber.user)

    with django_capture_on_commit_callbacks(execute=True):
        response = client.post(reverse("seo-setup-check", args=["search_console"]))

    assert response.json()["result"] == "confirmed"
    assert response.json()["complete"] is True
    assert _steps(response)["search_console"]["detail"] == "sc-domain:example.com"
    profile = SeoProfile.objects.get(subscriber=paid_seo_subscriber)
    assert profile.search_console_property == "sc-domain:example.com"
    [alert] = outbox
    assert alert.message_type == "seo.staff_reporting_ready"


def test_checking_again_does_not_tell_staff_twice(
    client, paid_seo_subscriber, google, outbox, django_capture_on_commit_callbacks
):
    google.found = "sc-domain:example.com"
    client.sign_in(paid_seo_subscriber.user)
    with django_capture_on_commit_callbacks(execute=True):
        client.post(reverse("seo-setup-check", args=["search_console"]))
        client.post(reverse("seo-setup-check", args=["search_console"]))

    assert [m.message_type for m in outbox] == ["seo.staff_reporting_ready"]


def test_a_check_that_finds_nothing_leaves_the_step(client, paid_seo_subscriber, google):
    client.sign_in(paid_seo_subscriber.user)
    response = client.post(reverse("seo-setup-check", args=["search_console"]))

    assert response.json()["result"] == "not_found"
    assert _steps(response)["search_console"]["state"] == "not_started"


def test_a_check_that_cannot_run_says_so_without_blaming_the_customer(
    client, paid_seo_subscriber, google
):
    google.unavailable = True
    client.sign_in(paid_seo_subscriber.user)
    response = client.post(reverse("seo-setup-check", args=["search_console"]))

    assert response.status_code == 200
    assert response.json()["result"] == "unavailable"
    assert _steps(response)["search_console"]["state"] == "not_started"


def test_steps_without_an_automatic_check_refuse_one(client, paid_seo_subscriber):
    client.sign_in(paid_seo_subscriber.user)
    assert client.post(reverse("seo-setup-check", args=["google_ads"])).status_code == 404


def test_staff_can_confirm_and_reset_a_step(
    client, paid_seo_subscriber, staff_user, outbox, django_capture_on_commit_callbacks
):
    client.sign_in(staff_user)
    url = reverse("admin-seo-setup-step", args=[paid_seo_subscriber.pk, "search_console"])

    with django_capture_on_commit_callbacks(execute=True):
        confirmed = client.post(url, {"action": "confirm"}, content_type="application/json")
    assert confirmed.json()["complete"] is True
    assert [m.message_type for m in outbox] == ["seo.staff_reporting_ready"]

    reset = client.post(url, {"action": "reset"}, content_type="application/json")
    assert _steps(reset)["search_console"]["state"] == "not_started"
    assert reset.json()["complete"] is False


def test_customers_cannot_confirm_through_the_staff_endpoint(client, paid_seo_subscriber):
    client.sign_in(paid_seo_subscriber.user)
    url = reverse("admin-seo-setup-step", args=[paid_seo_subscriber.pk, "search_console"])
    assert client.post(url, {"action": "confirm"}, content_type="application/json").status_code == 403


def test_staff_see_setup_on_the_subscriber_once_paid(client, seo_subscriber, staff_user):
    client.sign_in(staff_user)
    url = reverse("admin-seo-detail", args=[seo_subscriber.pk])
    assert client.get(url).json()["setup"] is None

    seo_subscriber.payment_status = SeoSubscriber.PaymentStatus.ACTIVE
    seo_subscriber.save(update_fields=["payment_status"])
    assert len(client.get(url).json()["setup"]["steps"]) == len(setup.STEP_ORDER)
