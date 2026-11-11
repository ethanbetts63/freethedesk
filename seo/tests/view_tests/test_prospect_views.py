from datetime import timedelta

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


def test_a_published_report_is_held_with_its_pdf_until_the_owner_approves_it(api_client, internal_key):
    response = upload(api_client, internal_key)

    assert response.status_code == 201
    body = response.json()
    assert body["outcome"] == "held"
    prospect = SeoProspect.objects.get()
    assert prospect.approved_at is None
    assert with_status(SeoProspect.objects.all()).get().status == "held"
    assert body["report_link"].endswith(f"-{prospect.link_token}")
    assert body["subject"] == "Your 'pergolas perth' ad, and what your site is missing"
    assert prospect.subject_version == 3
    assert (body["body_version"], prospect.body_version, prospect.metric) == (5, 5, "bookings")
    assert (body["purpose"], prospect.purpose, prospect.body) == ("client", "client", "")
    assert prospect.issues == ["No pergola page", "The home page has no heading"]
    assert prospect.paid_searches == ["pergolas perth"]
    assert prospect.sent_at is None
    with prospect.report_pdf.open("rb") as handle:
        assert handle.read() == PDF


def approve(api_client, key, slug="perthpatiomagic", **fields):
    return api_client.post(reverse("seo-prospect-approve"), {"slug": slug, **fields}, HTTP_X_INTERNAL_API_KEY=key)


def test_the_owners_word_approves_a_held_report_and_names_what_will_go(api_client, internal_key):
    upload(api_client, internal_key)

    response = approve(api_client, internal_key, metric="calls")

    assert response.status_code == 201
    body = response.json()
    prospect = SeoProspect.objects.get()
    assert body["outcome"] == "approved" and prospect.approved_at is not None
    assert body["subject"] == "Your 'pergolas perth' ad, and what your site is missing"
    assert (body["body_version"], body["metric"], prospect.metric) == (5, "calls", "calls")
    assert body["report_link"].endswith(f"-{prospect.link_token}")
    assert with_status(SeoProspect.objects.all()).get().status == "queued"


def test_the_word_taken_back_holds_the_report_again(api_client, internal_key):
    upload(api_client, internal_key)
    approve(api_client, internal_key)

    response = approve(api_client, internal_key, approved="0")

    assert response.status_code == 201 and response.json()["outcome"] == "held"
    assert SeoProspect.objects.get().approved_at is None


def test_a_report_already_sent_is_neither_approved_nor_held(api_client, internal_key):
    SeoProspectFactory(slug="gone", sent_at=timezone.now())
    assert approve(api_client, internal_key, slug="gone").status_code == 409
    assert approve(api_client, internal_key, slug="gone", approved="0").status_code == 409
    assert approve(api_client, internal_key, slug="nobody").status_code == 404


def test_approval_takes_the_shared_secret(api_client, internal_key):
    upload(api_client, internal_key)
    assert api_client.post(reverse("seo-prospect-approve"), {"slug": "perthpatiomagic"}).status_code in (401, 403)
    assert SeoProspect.objects.get().approved_at is None


def test_the_three_subjects_in_rotation_take_turns(api_client, internal_key):
    """Subjects 1, 2, 4 and 5 are retired (owner, 2026-10-30); 3, 6 and 7 rotate for a business with a paid search."""
    for n in range(4):
        upload(api_client, internal_key, domain=f"b{n}.com.au", slug=f"b{n}", email=f"o@b{n}.com.au")
    assert list(SeoProspect.objects.order_by("id").values_list("subject_version", flat=True)) == [3, 6, 7, 3]


def test_every_client_draws_the_fixes_list(api_client, internal_key):
    """One client body in the test today (owner, 2026-10-30); the levelling returns when a second is added."""
    for n in range(3):
        upload(api_client, internal_key, domain=f"b{n}.com.au", slug=f"b{n}", email=f"o@b{n}.com.au",
               metric="calls" if n == 1 else "bookings")
    assert list(SeoProspect.objects.order_by("id").values_list("body_version", flat=True)) == [5, 5, 5]
    assert SeoProspect.objects.get(slug="b1").metric == "calls"
    assert SeoProspect.objects.get(slug="b1").metric == "calls"


def test_an_affiliate_prospect_gets_the_affiliate_body(api_client, internal_key):
    """A podcast host's report takes body 3 and subject 8 every time, and leaves the client rotation level."""
    response = upload(api_client, internal_key, domain="peachbm.com.au", slug="peachbm", email="fi@peachbm.com.au",
                      business="Money Secrets", purpose="affiliate", paid_searches=[])

    assert response.status_code == 201
    assert (response.json()["purpose"], response.json()["body_version"]) == ("affiliate", 3)
    assert response.json()["body_label"] == "3: the affiliate offer"
    assert (response.json()["subject_version"], response.json()["subject"]) == (
        8, "Podcast affiliate offer for Money Secrets")


def test_with_no_paid_search_the_subject_that_names_one_is_skipped(api_client, internal_key):
    for n in range(3):
        upload(api_client, internal_key, domain=f"b{n}.com.au", slug=f"b{n}", email=f"o@b{n}.com.au", paid_searches=[])
    assert list(SeoProspect.objects.order_by("id").values_list("subject_version", flat=True)) == [6, 7, 6]


def test_with_no_subject_in_rotation_the_upload_is_refused(api_client, internal_key, monkeypatch):
    """Should every live subject need a paid search again, a business without one waits for a subject the owner
    approves; nothing is queued and the outbox says why."""
    from seo.utils import prospect_sending
    monkeypatch.setattr(prospect_sending, "PAUSED_SUBJECTS",
                        prospect_sending.PAUSED_SUBJECTS | {SeoProspect.Subject.SIX, SeoProspect.Subject.SEVEN})
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


def queue_follow_up(api_client, key, slug):
    return api_client.post(reverse("seo-prospect-follow-up"), {"slug": slug}, format="json",
                           HTTP_X_INTERNAL_API_KEY=key)


def test_a_follow_up_is_queued_a_week_after_the_report_email(api_client, internal_key):
    prospect = SeoProspectFactory(sent_at=timezone.now() - timedelta(days=7, minutes=1))

    response = queue_follow_up(api_client, internal_key, prospect.slug)

    assert response.status_code == 201 and response.json()["outcome"] == "queued"
    prospect.refresh_from_db()
    assert prospect.follow_up_queued_at is not None and prospect.followed_up_at is None
    # Its subject is drawn from the live rotation (the report went under 1, now retired) and its body is the
    # client body of the day, both kept on the row and named in the answer.
    assert prospect.follow_up_subject_version == 3 and prospect.follow_up_body_version == SeoProspect.Body.FIXES
    assert response.json()["subject"] == f"Your 'plumber perth' ad, and what your site is missing"
    assert response.json()["subject_version"] == 3 and response.json()["body_version"] == SeoProspect.Body.FIXES
    # Once only.
    assert queue_follow_up(api_client, internal_key, prospect.slug).json()["outcome"] == "already_queued"


def test_the_follow_up_subject_is_never_the_report_emails_and_is_levelled(api_client, internal_key):
    """A report that went under 6 is followed up under 3 or 7; without a paid search, under 7 alone; and the
    follow-ups level across the live subjects between them."""
    a = SeoProspectFactory(subject_version=6, sent_at=timezone.now() - timedelta(days=8))
    b = SeoProspectFactory(subject_version=6, sent_at=timezone.now() - timedelta(days=8), paid_searches=[])
    c = SeoProspectFactory(subject_version=7, sent_at=timezone.now() - timedelta(days=8))

    chosen = []
    for prospect in (a, b, c):
        assert queue_follow_up(api_client, internal_key, prospect.slug).status_code == 201
        prospect.refresh_from_db()
        chosen.append(prospect.follow_up_subject_version)

    assert chosen[0] in (3, 7) and chosen[1] == 7 and chosen[2] in (3, 6)
    assert chosen[0] != 6 and chosen[2] != 7


@pytest.mark.parametrize("fields, outcome", [
    ({"sent_at": None}, "not_sent"),
    ({"days": 6}, "too_soon"),
    ({"called_at": True}, "called"),
    ({"reply": SeoProspect.Reply.NEGATIVE}, "replied"),
    ({"excluded_reason": "Asked us not to"}, "excluded"),
])
def test_a_follow_up_is_refused_when_anything_has_stopped_it(api_client, internal_key, fields, outcome):
    now = timezone.now()
    days = fields.pop("days", 8)
    if fields.pop("called_at", False):
        fields["called_at"] = now
    prospect = SeoProspectFactory(**{"sent_at": now - timedelta(days=days), **fields})

    response = queue_follow_up(api_client, internal_key, prospect.slug)

    assert response.status_code == 409 and response.json()["outcome"] == outcome
    prospect.refresh_from_db()
    assert prospect.follow_up_queued_at is None


def test_a_suppressed_address_gets_no_follow_up(api_client, internal_key):
    prospect = SeoProspectFactory(sent_at=timezone.now() - timedelta(days=8))
    suppress(prospect.email, reason=Suppression.Reason.OPTED_OUT)
    assert queue_follow_up(api_client, internal_key, prospect.slug).json()["outcome"] == "suppressed"


def test_the_follow_up_takes_the_shared_secret(api_client, internal_key):
    prospect = SeoProspectFactory(sent_at=timezone.now() - timedelta(days=8))
    assert queue_follow_up(api_client, "wrong", prospect.slug).status_code in (401, 403)
    assert queue_follow_up(api_client, internal_key, "nobody").status_code == 404


def test_early_lifts_the_week_and_nothing_else(api_client, internal_key):
    """The owner's word to follow up before the week is out: a called prospect is still refused."""
    now = timezone.now()
    prospect = SeoProspectFactory(sent_at=now - timedelta(days=5))
    called = SeoProspectFactory(sent_at=now - timedelta(days=5), called_at=now)

    def early(slug):
        return api_client.post(reverse("seo-prospect-follow-up"), {"slug": slug, "early": "1"}, format="json",
                               HTTP_X_INTERNAL_API_KEY=internal_key)

    assert early(prospect.slug).json()["outcome"] == "queued"
    assert early(called.slug).json()["outcome"] == "called"
