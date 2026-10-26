import pytest
from django.urls import reverse
from freetheplatform.messaging import Suppression, suppress

from affiliates.models import PodcastProspect
from affiliates.serializers.prospect_upload import MAX_BATCH
from affiliates.tests.factories import entry

pytestmark = pytest.mark.django_db


def upload(api_client, entries, key):
    return api_client.post(
        reverse("outreach-upload"), {"entries": entries}, format="json", HTTP_X_INTERNAL_API_KEY=key
    )


def test_a_batch_creates_prospects_and_assigns_versions_in_rotation(api_client, internal_key):
    entries = [entry(email=f"host{i}@example.com", email_source=f"https://f.example/{i}.rss") for i in range(4)]

    response = upload(api_client, entries, internal_key)

    assert response.status_code == 200
    body = response.json()
    assert (body["created"], body["already_known"], body["suppressed"], body["invalid"]) == (4, 0, 0, 0)
    assert [r["outcome"] for r in body["results"]] == ["created"] * 4
    assert sorted(PodcastProspect.objects.values_list("version", flat=True)) == ["a", "a", "b", "c"]
    prospect = PodcastProspect.objects.get(email="host0@example.com")
    assert prospect.first_name == "Sam"
    assert prospect.opener == "Came across your episode on quoting jobs."
    assert str(prospect.last_release_date) == "2026-10-20"
    assert prospect.pitched_at is None


def test_the_server_decides_what_is_new(api_client, internal_key):
    suppress("gone@example.com", reason=Suppression.Reason.BOUNCED)
    upload(api_client, [entry(email="Sam@TheTradieShow.com.au")], internal_key)

    response = upload(
        api_client,
        [
            entry(email="sam@thetradieshow.com.au", opener="A different opener."),
            entry(email="gone@example.com", email_source="https://f.example/gone.rss"),
            entry(email="not an address"),
            entry(email="new@example.com", email_source="https://f.example/new.rss"),
        ],
        internal_key,
    )

    body = response.json()
    assert [r["outcome"] for r in body["results"]] == ["already_known", "suppressed", "invalid", "created"]
    assert "email" in body["results"][2]["errors"]
    assert PodcastProspect.objects.count() == 2
    # Already known means untouched: the server's row is the record.
    assert PodcastProspect.objects.get(email="sam@thetradieshow.com.au").opener == entry()["opener"]


def test_the_same_address_twice_in_one_batch_is_one_prospect(api_client, internal_key):
    response = upload(api_client, [entry(), entry(podcast_name="Another show")], internal_key)
    assert [r["outcome"] for r in response.json()["results"]] == ["created", "already_known"]


def test_the_shared_secret_is_the_whole_credential(api_client, internal_key, settings):
    assert upload(api_client, [entry()], "wrong").status_code == 403
    assert upload(api_client, [entry()], "").status_code == 403
    settings.INTERNAL_API_KEY = ""
    assert upload(api_client, [entry()], "").status_code == 403
    assert PodcastProspect.objects.count() == 0


def test_a_staff_session_is_not_enough(api_client, staff_user, internal_key):
    api_client.force_authenticate(staff_user)
    assert api_client.post(reverse("outreach-upload"), {"entries": [entry()]}, format="json").status_code == 403


def test_the_batch_is_capped(api_client, internal_key):
    entries = [entry(email=f"h{i}@example.com") for i in range(MAX_BATCH + 1)]
    response = upload(api_client, entries, internal_key)
    assert response.status_code == 400
    assert upload(api_client, [], internal_key).status_code == 400
