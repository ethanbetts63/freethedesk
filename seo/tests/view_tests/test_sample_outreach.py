"""The sample email: held by the pipeline, approved on the owner's word, sent once by the hourly run, plain text."""

import hashlib
from datetime import datetime, timezone as dt_timezone
from io import StringIO
from zoneinfo import ZoneInfo

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.urls import reverse
from freetheplatform.messaging import Message, suppress

from affiliates.management.commands import send_affiliate_outreach as command
from seo.models import SeoSampleReport
from seo.tests.factories import SeoProspectFactory
from seo.tests.factories.prospect_factory import upload_fields
from seo.utils.prospect_sending import FOLLOW_UP_LINE
from seo.utils.sample_links import sample_link
from seo.utils.sample_sending import body_for, subject_for

pytestmark = pytest.mark.django_db

PERTH = ZoneInfo("Australia/Perth")
HTML = b"<!doctype html>\n<html lang=\"en\">\n<head>\n<title>Companion</title>\n</head>\n<body><p>What changed.</p></body>\n</html>\n"
SHA = hashlib.sha256(HTML).hexdigest()
TITLES = [
    "A clean header and one look, not graffiti over photos",
    "Call or book from the first screen on a phone",
    "Your number and Book a Consultation on every page",
    "A home page that says what you do and where",
    "A fifth the email leaves out",
]


def monday_ten():
    return datetime(2026, 10, 26, 10, 30, tzinfo=PERTH).astimezone(dt_timezone.utc)


def publish(api_client, key, html=HTML, project="embycabinets", **fields):
    data = {
        "project": project, "business": "Emby Cabinets", "domain": "embycabinets.com",
        "demo_url": "https://samples.freethedesk.com.au/emby-cabinets/",
        "report_html": SimpleUploadedFile("companion.html", html, content_type="text/html"), **fields,
    }
    return api_client.post(reverse("seo-sample-upload"), data, format="multipart", HTTP_X_INTERNAL_API_KEY=key)


def hold(api_client, key, project="embycabinets", **fields):
    data = {"project": project, "email": "Embycabinets@gmail.com", "first_name": "Scott", "contact_name": "Scott",
            "phone": "0458 427 495", "domain": "www.embycabinets.com", "titles": TITLES[:4], **fields}
    return api_client.post(reverse("seo-sample-hold"), data, format="json", HTTP_X_INTERNAL_API_KEY=key)


def approve(api_client, key, project="embycabinets", **fields):
    return api_client.post(reverse("seo-sample-approve"), {"project": project, "page_sha256": SHA, **fields},
                           format="json", HTTP_X_INTERNAL_API_KEY=key)


def run(monkeypatch, now):
    monkeypatch.setattr(command.timezone, "now", lambda: now)
    monkeypatch.setattr(command.time, "sleep", lambda seconds: None)
    out = StringIO()
    call_command("send_affiliate_outreach", stdout=out, stderr=out)
    return out.getvalue()


@pytest.fixture
def held(api_client, internal_key):
    publish(api_client, internal_key)
    assert hold(api_client, internal_key).status_code == 201
    return SeoSampleReport.objects.get()


def test_the_email_is_the_owners_words_with_four_titles_and_the_link(held):
    assert subject_for(held) == "A redesign of embycabinets.com"
    assert body_for(held) == f"""Hi Scott,

My name's Ethan Betts. I'm from Perth. I've rebuilt your website to look, rank and load better. I've hosted it on the links below so you can take a look. There's obviously no obligation but if you like it I'd love to talk to you about it.

See the redesign itself here: https://samples.freethedesk.com.au/emby-cabinets/
You can read an explanation of the changes here: {sample_link(held)}

The report goes through every change: what your site does now, what the redesign does instead, and why it matters to your customers or to Google. A few of them:

1. A clean header and one look, not graffiti over photos
2. Call or book from the first screen on a phone
3. Your number and Book a Consultation on every page
4. A home page that says what you do and where

If you want to go through it first, my number is below. I can explain any part of it. Reply 'no thanks' and I won't email again.

Ethan Betts
Director, freethedesk
0423 853 830
www.freethedesk.com.au
"""


def test_hold_needs_the_secret_and_a_published_sample(api_client, internal_key):
    assert hold(api_client, "wrong").status_code in (401, 403)
    assert hold(api_client, internal_key).status_code == 404


def test_hold_refuses_fewer_than_four_titles(api_client, internal_key):
    publish(api_client, internal_key)
    assert hold(api_client, internal_key, titles=TITLES[:3]).status_code == 400
    assert SeoSampleReport.objects.get().held_at is None


def test_a_sample_with_no_name_is_held_and_greets_there(api_client, internal_key):
    from seo.utils.sample_sending import body_for

    publish(api_client, internal_key)
    assert hold(api_client, internal_key, first_name="", contact_name="").status_code in (200, 201)
    sample = SeoSampleReport.objects.get()
    assert sample.held_at is not None
    assert body_for(sample).startswith("Hi there,\n\n")


def test_a_held_sample_is_not_sent_and_an_approved_one_is_sent_once(api_client, internal_key, held, outbox,
                                                                     monkeypatch):
    run(monkeypatch, monday_ten())
    assert outbox == []

    answer = approve(api_client, internal_key)
    assert answer.status_code == 201 and answer.json()["outcome"] == "approved"
    output = run(monkeypatch, monday_ten())

    assert "1 sample email(s) sent." in output
    [message] = outbox
    held.refresh_from_db()
    assert message.to == "embycabinets@gmail.com"
    assert message.message_type == "seo_sample"
    assert message.subject == "A redesign of embycabinets.com"
    assert message.body_text == body_for(held).rstrip()
    assert message.body_html == ""
    assert message.attachments == []
    assert Message.objects.get().content_object == held
    assert held.sent_at == monday_ten()

    run(monkeypatch, monday_ten())
    assert len(outbox) == 1
    assert approve(api_client, internal_key).status_code == 409


def test_approval_names_the_page_uploaded(api_client, internal_key, held):
    assert approve(api_client, internal_key, page_sha256="0" * 64).json()["outcome"] == "page_changed"
    assert approve(api_client, internal_key, page_sha256="").status_code == 409
    held.refresh_from_db()
    assert held.approved_at is None


def test_a_changed_page_takes_the_approval_back_and_the_same_page_does_not(api_client, internal_key, held):
    approve(api_client, internal_key)
    assert publish(api_client, internal_key).json()["held_again"] is False
    held.refresh_from_db()
    assert held.approved_at is not None

    assert publish(api_client, internal_key, html=HTML.replace(b"What", b"How")).json()["held_again"] is True
    held.refresh_from_db()
    assert held.approved_at is None


def test_a_sample_never_held_cannot_be_approved(api_client, internal_key):
    publish(api_client, internal_key)
    assert approve(api_client, internal_key).json()["outcome"] == "not_held"


def test_one_email_per_business(api_client, internal_key, held):
    publish(api_client, internal_key, project="other")
    assert hold(api_client, internal_key, project="other").json()["field"] == "email"
    assert hold(api_client, internal_key, project="other", email="b@other.com.au").json()["field"] == "domain"

    SeoProspectFactory(email="owner@prospect.com.au", domain="prospect.com.au")
    refused = hold(api_client, internal_key, project="other", email="owner@prospect.com.au", domain="x.com.au")
    assert refused.status_code == 409 and refused.json()["field"] == "email"

    # And a prospect report for a business with a sample held is refused too.
    page = SimpleUploadedFile("report.html", b"<html></html>", content_type="text/html")
    fields = upload_fields(email="embycabinets@gmail.com", domain="embycabinets.com", slug="emby")
    response = api_client.post(reverse("seo-prospect-upload"), {**fields, "report_html": page}, format="multipart",
                               HTTP_X_INTERNAL_API_KEY=internal_key)
    assert response.status_code == 409 and response.json()["field"] == "email"


def test_a_suppressed_address_is_refused_at_hold_and_never_sent(api_client, internal_key, held, outbox,
                                                                monkeypatch):
    approve(api_client, internal_key)
    suppress("embycabinets@gmail.com")
    run(monkeypatch, monday_ten())
    assert outbox == []

    publish(api_client, internal_key, project="other")
    suppress("x@other.com.au")
    refused = hold(api_client, internal_key, project="other", email="x@other.com.au", domain="other.com.au")
    assert refused.json()["outcome"] == "suppressed"


def test_the_follow_up_goes_on_the_owners_word_once(api_client, internal_key, held, outbox, monkeypatch):
    def follow_up(**fields):
        return api_client.post(reverse("seo-sample-follow-up"), {"project": "embycabinets", **fields}, format="json",
                               HTTP_X_INTERNAL_API_KEY=internal_key)

    assert follow_up().json()["outcome"] == "not_sent"
    approve(api_client, internal_key)
    run(monkeypatch, monday_ten())
    assert follow_up().status_code == 201
    assert follow_up().json()["outcome"] == "already_queued"

    run(monkeypatch, monday_ten())
    follow = outbox[-1]
    assert len(outbox) == 2
    assert follow.message_type == "seo_sample_follow_up"
    assert follow.subject == "A redesign of embycabinets.com"
    assert follow.body_text.startswith(f"Hi Scott,\n\n{FOLLOW_UP_LINE} My name's Ethan Betts. I'm from Perth.")
    assert follow_up().json()["outcome"] == "already_followed_up"
    assert follow_up(again="1").status_code == 201
