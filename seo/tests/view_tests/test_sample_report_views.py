"""A sample's companion report: uploaded by the sample pipeline's publish, served at /reports/<business>-<token>
beside the prospect reports."""

from datetime import timedelta
from urllib.parse import urlencode

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from freetheplatform.auth.conf import cookie_names
from rest_framework_simplejwt.tokens import AccessToken

from core.utils.urls import site_url
from seo.models import SeoSampleOpen, SeoSampleReport
from seo.utils.sample_links import sample_key

pytestmark = pytest.mark.django_db

HTML = b"<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<title>Companion</title>\n</head>\n<body>\n<main><p>What changed.</p></main>\n</body>\n</html>\n"
PHONE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
PREVIEW_UA = "facebookexternalhit/1.1"


def upload(api_client, key, html=HTML, **fields):
    data = {
        "project": "jsrmassage",
        "business": "Joondalup Sports Remedial Massage",
        "domain": "jsrmassage.com.au",
        "demo_url": "https://samples.freethedesk.com.au/jsr-massage/",
        "report_html": SimpleUploadedFile("companion.html", html, content_type="text/html"),
        **fields,
    }
    return api_client.post(reverse("seo-sample-upload"), data, format="multipart", HTTP_X_INTERNAL_API_KEY=key)


def test_an_upload_needs_the_shared_secret(api_client, internal_key):
    assert upload(api_client, "wrong").status_code in (401, 403)
    assert not SeoSampleReport.objects.exists()


def test_an_upload_gives_the_report_a_link_and_a_second_keeps_it(api_client, internal_key):
    first = upload(api_client, internal_key)
    assert first.status_code == 201
    sample = SeoSampleReport.objects.get()
    assert first.json()["link"] == f"{site_url()}/reports/joondalup-sports-remedial-massage-{sample.link_token}"

    second = upload(api_client, internal_key, html=HTML.replace(b"What changed.", b"Changed again."),
                    demo_url="https://samples.freethedesk.com.au/jsr-massage-2/")
    assert second.status_code == 200
    assert second.json()["link"] == first.json()["link"]
    sample.refresh_from_db()
    assert sample.demo_url.endswith("/jsr-massage-2/")
    with sample.report_html.open("rb") as handle:
        assert b"Changed again." in handle.read()


def test_the_page_serves_the_report_noindexed_with_the_redesign_button(api_client, internal_key, client):
    upload(api_client, internal_key)
    sample = SeoSampleReport.objects.get()

    page = client.get(reverse("seo-report-page", args=[sample_key(sample)]), HTTP_USER_AGENT=PHONE_UA)
    document = page.content.decode()

    assert page.status_code == 200
    assert page["X-Robots-Tag"] == "noindex, nofollow, noarchive"
    assert "What changed." in document
    # The button's visits to the redesign name the report as where they came from.
    assert 'href="https://samples.freethedesk.com.au/jsr-massage/?s=report"' in document
    assert "Open the redesign" in document
    assert '<meta property="og:title" content="Joondalup Sports Remedial Massage: website redesign">' in document
    # Logged as a prospect report's open is: one row, by a person, with where the link came from.
    client.get(reverse("seo-report-page", args=[sample_key(sample)]) + "?s=text", HTTP_USER_AGENT=PHONE_UA)
    opens = list(sample.opens.order_by("id"))
    assert [(o.kind, o.source, o.likely_bot) for o in opens] == [("page", "", False), ("page", "text", False)]


def test_a_preview_fetch_is_not_an_open_and_the_token_alone_is_sent_on(api_client, internal_key, client):
    upload(api_client, internal_key)
    sample = SeoSampleReport.objects.get()

    client.get(reverse("seo-report-page", args=[sample_key(sample)]), HTTP_USER_AGENT=PREVIEW_UA)
    assert [o.likely_bot for o in sample.opens.all()] == [True]

    bare = client.get(reverse("seo-report-page", args=[sample.link_token]))
    assert bare.status_code == 302
    assert bare["Location"].endswith(f"/reports/{sample_key(sample)}")


def test_an_unknown_token_is_not_found(client):
    assert client.get(reverse("seo-report-page", args=["nobody-abcdefghjk"])).status_code == 404


def visit(client, demo="jsr-massage", source="", agent=PHONE_UA):
    """The counter's post, as a browser's sendBeacon sends it: a form, not JSON or multipart."""
    return client.post(reverse("seo-sample-visit"), urlencode({"demo": demo, "s": source}),
                       content_type="application/x-www-form-urlencoded", HTTP_USER_AGENT=agent)


def test_the_owner_signed_in_opens_and_visits_nothing(api_client, internal_key, client, staff_user):
    upload(api_client, internal_key)
    sample = SeoSampleReport.objects.get()
    client.cookies[cookie_names()[0]] = str(AccessToken.for_user(staff_user))

    assert client.get(reverse("seo-report-page", args=[sample_key(sample)]), HTTP_USER_AGENT=PHONE_UA).status_code == 200
    assert visit(client).status_code == 204
    assert not SeoSampleOpen.objects.exists()


def test_a_visit_to_the_redesign_is_logged_beside_the_reports_opens(api_client, internal_key, client):
    upload(api_client, internal_key)
    sample = SeoSampleReport.objects.get()

    assert visit(client, source="report").status_code == 204
    assert visit(client, source="email").status_code == 204
    # A source the links never carry is recorded as none; a crawler that runs the counter is marked.
    assert visit(client, source="<script>").status_code == 204
    assert visit(client, agent=PREVIEW_UA).status_code == 204
    rows = [(o.kind, o.source, o.likely_bot) for o in sample.opens.order_by("id")]
    assert rows == [("demo", "report", False), ("demo", "email", False), ("demo", "", False), ("demo", "", True)]


def test_a_visit_names_a_redesign_that_exists(api_client, internal_key, client):
    upload(api_client, internal_key)

    assert visit(client, demo="nobody-here").status_code == 404
    assert visit(client, demo="../jsr-massage").status_code == 400
    assert visit(client, demo="").status_code == 400
    assert client.get(reverse("seo-sample-visit")).status_code == 405
    assert not SeoSampleOpen.objects.exists()


def test_the_status_counts_people_since_the_email_went(api_client, internal_key, client):
    upload(api_client, internal_key)
    sample = SeoSampleReport.objects.get()
    page = reverse("seo-report-page", args=[sample_key(sample)])

    def status():
        answer = api_client.get(reverse("seo-sample-status"), HTTP_X_INTERNAL_API_KEY=internal_key)
        assert answer.status_code == 200
        (row,) = answer.json()["samples"]
        return row

    assert api_client.get(reverse("seo-sample-status"), HTTP_X_INTERNAL_API_KEY="wrong").status_code in (401, 403)
    # Not sent: a look is the owner checking the page, and counts for nothing.
    client.get(page, HTTP_USER_AGENT=PHONE_UA)
    visit(client)
    row = status()
    assert row["project"] == "jsrmassage" and row["sent_at"] is None
    assert (row["opens"], row["demo_visits"], row["last_opened_at"], row["last_visited_at"]) == (0, 0, None, None)

    SeoSampleReport.objects.filter(pk=sample.pk).update(sent_at=timezone.now() - timedelta(minutes=5))
    SeoSampleOpen.objects.update(opened_at=timezone.now() - timedelta(hours=1))
    client.get(page, HTTP_USER_AGENT=PHONE_UA)
    client.get(page, HTTP_USER_AGENT=PREVIEW_UA)
    visit(client, source="email")
    visit(client, source="report")
    row = status()
    assert (row["opens"], row["demo_visits"]) == (1, 2)
    assert row["last_opened_at"] is not None and row["last_visited_at"] is not None
