import pytest
from django.urls import reverse
from django.utils import timezone
from freetheplatform.messaging import Message, Suppression

from affiliates.tests.factories import AffiliateFactory
from core.tests.factories import UserFactory
from affiliates.models import PodcastProspect
from affiliates.tests.factories import ProspectFactory
from affiliates.utils.pitching import send_pitch

pytestmark = pytest.mark.django_db

LIST = reverse("admin-prospect-list")


def detail(prospect):
    return reverse("admin-prospect-detail", args=[prospect.pk])


def test_the_outreach_pages_are_staff_only(api_client):
    prospect = ProspectFactory()
    assert api_client.get(LIST).status_code == 401
    api_client.force_authenticate(UserFactory())
    assert api_client.get(LIST).status_code == 403
    assert api_client.get(detail(prospect)).status_code == 403
    assert api_client.get(reverse("admin-outreach-summary")).status_code == 403
    assert api_client.post(reverse("admin-prospect-unsubscribe", args=[prospect.pk])).status_code == 403


def test_status_is_composed_from_the_row_and_the_message_log(api_client, staff_user, outbox):
    queued = ProspectFactory(podcast_name="Queued")
    sent = ProspectFactory(podcast_name="Sent", pitched_at=timezone.now())
    send_pitch(sent)
    bounced = ProspectFactory(podcast_name="Bounced", pitched_at=timezone.now())
    message = send_pitch(bounced)
    Message.objects.filter(pk=message.pk).update(status=Message.Status.BOUNCED)
    signed = ProspectFactory(podcast_name="Signed", pitched_at=timezone.now(), affiliate=AffiliateFactory())
    excluded = ProspectFactory(podcast_name="Excluded", excluded_reason="Asked us not to.")
    api_client.force_authenticate(staff_user)

    rows = {row["podcast_name"]: row for row in api_client.get(LIST).json()["results"]}

    assert rows["Queued"]["status"] == "queued"
    assert rows["Sent"]["status"] == "sent"
    assert rows["Bounced"]["status"] == "bounced"
    assert rows["Signed"]["status"] == "signed_up"
    assert rows["Signed"]["affiliate_name"] == "The Tradie Show"
    assert rows["Excluded"]["status"] == "excluded"
    assert {queued.pk, sent.pk, bounced.pk, signed.pk, excluded.pk} == {row["id"] for row in rows.values()}

    assert [r["podcast_name"] for r in api_client.get(LIST, {"status": "bounced,excluded"}).json()["results"]] == [
        "Excluded", "Bounced",
    ]
    assert api_client.get(LIST, {"search": "sign"}).json()["count"] == 1
    assert api_client.get(detail(bounced)).json()["status"] == "bounced"


def test_filters_by_version_and_reply(api_client, staff_user):
    ProspectFactory(version="a", reply="positive")
    ProspectFactory(version="b")
    api_client.force_authenticate(staff_user)

    assert api_client.get(LIST, {"version": "b"}).json()["count"] == 1
    assert api_client.get(LIST, {"reply": "positive"}).json()["count"] == 1
    assert api_client.get(LIST, {"version": "a,b"}).json()["count"] == 2


def test_staff_can_record_a_reply_and_exclude_but_change_nothing_else(api_client, staff_user):
    prospect = ProspectFactory(email="sam@thetradieshow.com.au", opener="Original.")
    api_client.force_authenticate(staff_user)

    response = api_client.patch(
        detail(prospect),
        {"reply": "positive", "excluded_reason": "Signed elsewhere.", "opener": "Changed", "email": "x@example.com"},
        format="json",
    )

    assert response.status_code == 200
    prospect.refresh_from_db()
    assert prospect.reply == PodcastProspect.Reply.POSITIVE
    assert prospect.excluded_reason == "Signed elsewhere."
    assert prospect.opener == "Original."
    assert prospect.email == "sam@thetradieshow.com.au"
    assert response.json()["status"] == "excluded"
    assert api_client.patch(detail(prospect), {"reply": "maybe"}, format="json").status_code == 400


def test_the_no_thanks_button_suppresses_and_records_a_negative_reply(api_client, staff_user):
    prospect = ProspectFactory(email="sam@thetradieshow.com.au")
    api_client.force_authenticate(staff_user)

    response = api_client.post(reverse("admin-prospect-unsubscribe", args=[prospect.pk]))

    assert response.status_code == 200
    assert response.json()["reply"] == "negative"
    assert Suppression.objects.get(address="sam@thetradieshow.com.au").reason == Suppression.Reason.OPTED_OUT
    assert api_client.post(reverse("admin-prospect-unsubscribe", args=[prospect.pk + 99])).status_code == 404


def test_the_summary_counts_each_version(api_client, staff_user, outbox):
    ProspectFactory(version="a")
    sent = ProspectFactory(version="a", pitched_at=timezone.now(), reply="positive")
    send_pitch(sent)
    ProspectFactory(version="b", affiliate=AffiliateFactory())
    api_client.force_authenticate(staff_user)

    versions = {row["version"]: row for row in api_client.get(reverse("admin-outreach-summary")).json()["versions"]}

    assert versions["a"]["total"] == 2
    assert versions["a"]["queued"] == 1
    assert versions["a"]["sent"] == 1
    assert versions["a"]["positive"] == 1
    assert versions["b"] == {**versions["b"], "total": 1, "signed_up": 1, "positive": 0}
    assert versions["c"]["total"] == 0
