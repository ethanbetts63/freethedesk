import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from freetheplatform.messaging import Suppression, is_suppressed, suppress

from seo.models import SeoProspect
from seo.tests.factories import PDF, SeoProspectFactory, upload_fields
from seo.utils.prospects import with_status

pytestmark = pytest.mark.django_db


def upload(api_client, key, pdf=PDF, **overrides):
    fields = upload_fields(**overrides)
    data = {**fields, "report_pdf": SimpleUploadedFile("report.pdf", pdf, content_type="application/pdf")}
    return api_client.post(reverse("seo-prospect-upload"), data, format="multipart", HTTP_X_INTERNAL_API_KEY=key)


def test_a_published_report_is_queued_with_its_pdf(api_client, internal_key):
    response = upload(api_client, internal_key)

    assert response.status_code == 201
    body = response.json()
    assert body["outcome"] == "queued"
    prospect = SeoProspect.objects.get()
    assert body["subject"] == "Your 'pergolas perth' ad, and what your site is missing"
    assert prospect.subject_version == 3
    assert (body["body_version"], prospect.body_version, prospect.metric) == (5, 5, "bookings")
    assert (body["purpose"], prospect.purpose, prospect.body) == ("client", "client", "")
    assert prospect.issues == ["No pergola page", "The home page has no heading"]
    assert prospect.paid_searches == ["pergolas perth"]
    assert prospect.sent_at is None
    with prospect.report_pdf.open("rb") as handle:
        assert handle.read() == PDF


def test_only_the_subject_in_rotation_is_drawn(api_client, internal_key):
    """Subjects 1, 2, 4 and 5 are retired (owner, 2026-10-30); 3 is what a business with a paid search gets."""
    for n in range(3):
        upload(api_client, internal_key, domain=f"b{n}.com.au", slug=f"b{n}", email=f"o@b{n}.com.au")
    assert list(SeoProspect.objects.order_by("id").values_list("subject_version", flat=True)) == [3, 3, 3]


def test_every_client_draws_the_fixes_list(api_client, internal_key):
    """One client body in the test today (owner, 2026-10-30); the levelling returns when a second is added."""
    for n in range(3):
        upload(api_client, internal_key, domain=f"b{n}.com.au", slug=f"b{n}", email=f"o@b{n}.com.au",
               metric="calls" if n == 1 else "bookings")
    assert list(SeoProspect.objects.order_by("id").values_list("body_version", flat=True)) == [5, 5, 5]
    assert SeoProspect.objects.get(slug="b1").metric == "calls"
    assert SeoProspect.objects.get(slug="b1").metric == "calls"


def test_an_affiliate_prospect_gets_the_affiliate_body(api_client, internal_key):
    """A podcast host's report takes body 3 every time. (With a paid search here only so a subject exists: see the
    next test.)"""
    response = upload(api_client, internal_key, domain="peachbm.com.au", slug="peachbm", email="fi@peachbm.com.au",
                      business="Money Secrets", purpose="affiliate", paid_searches=["bookkeeper melbourne"])

    assert response.status_code == 201
    assert (response.json()["purpose"], response.json()["body_version"]) == ("affiliate", 3)
    assert response.json()["body_label"] == "3: the affiliate offer"


def test_with_no_paid_search_and_no_subject_in_rotation_the_upload_is_refused(api_client, internal_key):
    """Every subject still in rotation names a paid search, so a business without one waits for a subject the owner
    approves; nothing is queued and the outbox says why."""
    response = upload(api_client, internal_key, paid_searches=[])
    assert response.status_code == 400
    assert response.json()["outcome"] == "no_subject"
    assert not SeoProspect.objects.exists()


@pytest.mark.parametrize("field, value", [
    ("domain", "www.PerthPatioMagic.com.au"),
    ("slug", "perthpatiomagic"),
    ("email", "SALES@perthpatiomagic.com.au"),
])
def test_one_report_per_business(api_client, internal_key, field, value):
    upload(api_client, internal_key)
    others = {"domain": "other.com.au", "slug": "other", "email": "o@other.com.au", field: value}

    response = upload(api_client, internal_key, **others)

    assert response.status_code == 409
    assert response.json()["field"] == field
    assert SeoProspect.objects.count() == 1


def test_a_suppressed_address_is_refused(api_client, internal_key):
    suppress("sales@perthpatiomagic.com.au", reason=Suppression.Reason.OPTED_OUT)
    response = upload(api_client, internal_key)
    assert response.status_code == 409
    assert response.json()["outcome"] == "suppressed"


def test_only_a_pdf_is_taken(api_client, internal_key):
    response = upload(api_client, internal_key, pdf=b"<html>not a report</html>")
    assert response.status_code == 400
    assert "report_pdf" in response.json()


def test_the_shared_secret_is_the_whole_credential(api_client, internal_key, settings):
    assert upload(api_client, "wrong").status_code == 403
    settings.INTERNAL_API_KEY = ""
    assert upload(api_client, "").status_code == 403


def test_the_calls_list_puts_the_uncalled_first(api_client, staff_user):
    called = SeoProspectFactory(business="Called", sent_at=timezone.now(), called_at=timezone.now())
    waiting = SeoProspectFactory(business="Waiting", sent_at=timezone.now())
    api_client.force_authenticate(staff_user)

    response = api_client.get(reverse("admin-seo-prospect-list"))

    assert response.status_code == 200
    rows = response.json()["results"]
    assert [r["business"] for r in rows] == [waiting.business, called.business]
    assert rows[0]["report_path"] == waiting.report_path
    assert rows[0]["subject"] == "I spent 3 hours on this. I am not a bot."


def test_the_owner_marks_a_call_and_nothing_else(api_client, staff_user):
    prospect = SeoProspectFactory()
    api_client.force_authenticate(staff_user)
    at = "2026-10-29T10:00:00+08:00"

    response = api_client.patch(
        reverse("admin-seo-prospect-detail", args=[prospect.pk]),
        {"called_at": at, "call_notes": "Spoke to Reece; call back Friday.", "reply": "positive", "email": "x@y.z"},
        format="json",
    )

    assert response.status_code == 200
    prospect.refresh_from_db()
    assert prospect.called_at is not None
    assert prospect.call_notes == "Spoke to Reece; call back Friday."
    assert prospect.reply == "positive"
    assert prospect.email != "x@y.z"


def test_no_thanks_suppresses_the_address(api_client, staff_user):
    prospect = SeoProspectFactory()
    api_client.force_authenticate(staff_user)

    response = api_client.post(reverse("admin-seo-prospect-unsubscribe", args=[prospect.pk]))

    assert response.status_code == 200
    assert is_suppressed(prospect.email)
    assert response.json()["reply"] == "negative"


def test_the_summary_counts_each_subject(api_client, staff_user):
    SeoProspectFactory(subject_version=2, called_at=timezone.now(), reply="positive")
    SeoProspectFactory(subject_version=2)
    api_client.force_authenticate(staff_user)

    subjects = {s["subject_version"]: s for s in api_client.get(reverse("admin-seo-prospect-summary")).json()["subjects"]}

    assert (subjects[2]["total"], subjects[2]["queued"], subjects[2]["called"], subjects[2]["positive"]) == (2, 2, 1, 1)
    assert subjects[1]["total"] == 0


def test_the_summary_counts_each_body_too(api_client, staff_user):
    SeoProspectFactory(body_version=2, reply="positive")
    SeoProspectFactory(body_version=1)
    api_client.force_authenticate(staff_user)

    bodies = {b["body_version"]: b for b in api_client.get(reverse("admin-seo-prospect-summary")).json()["bodies"]}

    assert (bodies[2]["total"], bodies[2]["positive"], bodies[1]["total"], bodies[1]["positive"]) == (1, 1, 1, 0)


def test_staff_only(api_client):
    assert api_client.get(reverse("admin-seo-prospect-list")).status_code in (401, 403)


def send_by_hand(api_client, key, **overrides):
    data = {
        "to": "sales@perthpatiomagic.com.au", "subject": "Your report again", "body": "Thanks for taking my call.",
        "attachments": SimpleUploadedFile("report.pdf", PDF, content_type="application/pdf"), **overrides,
    }
    return api_client.post(reverse("seo-message-send"), data, format="multipart", HTTP_X_INTERNAL_API_KEY=key)


def test_an_email_written_by_hand_goes_as_given_with_its_file(api_client, internal_key, outbox):
    prospect = SeoProspectFactory()

    response = send_by_hand(api_client, internal_key, to=prospect.email)

    assert response.status_code == 201
    assert response.json()["status"] == "sent"
    [message] = outbox
    assert message.to == prospect.email
    assert message.subject == "Your report again"
    assert message.body_text == "Thanks for taking my call."
    assert message.body_html == ""
    assert message.message_type == "seo_followup"
    assert message.attachments == [{"name": "report.pdf", "size": len(PDF)}]
    assert message.content_object == prospect


def test_a_note_after_the_call_leaves_the_report_email_status_alone(api_client, internal_key, outbox):
    prospect = SeoProspectFactory(sent_at=timezone.now())
    send_by_hand(api_client, internal_key, to=prospect.email)
    assert with_status(SeoProspect.objects.all()).get(pk=prospect.pk).status == "queued"


def test_a_suppressed_address_is_not_emailed_by_hand_either(api_client, internal_key, outbox):
    suppress("sales@perthpatiomagic.com.au", reason=Suppression.Reason.OPTED_OUT)
    response = send_by_hand(api_client, internal_key)
    assert response.status_code == 409
    assert outbox == []


def test_a_staff_login_does_not_open_the_terminal_endpoint(api_client, internal_key, staff_user, outbox):
    api_client.force_authenticate(staff_user)
    assert send_by_hand(api_client, "wrong").status_code == 403
    assert outbox == []
