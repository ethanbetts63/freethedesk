"""A sample's companion report: uploaded by the sample pipeline's publish, served at /reports/<business>-<token>
beside the prospect reports."""

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse

from core.utils.urls import site_url
from seo.models import SeoSampleReport
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
    assert 'href="https://samples.freethedesk.com.au/jsr-massage/"' in document
    assert "Open the redesign" in document
    assert '<meta property="og:title" content="Joondalup Sports Remedial Massage: website redesign">' in document
    sample.refresh_from_db()
    assert sample.opens == 1


def test_a_preview_fetch_is_not_an_open_and_the_token_alone_is_sent_on(api_client, internal_key, client):
    upload(api_client, internal_key)
    sample = SeoSampleReport.objects.get()

    client.get(reverse("seo-report-page", args=[sample_key(sample)]), HTTP_USER_AGENT=PREVIEW_UA)
    sample.refresh_from_db()
    assert sample.opens == 0

    bare = client.get(reverse("seo-report-page", args=[sample.link_token]))
    assert bare.status_code == 302
    assert bare["Location"].endswith(f"/reports/{sample_key(sample)}")


def test_an_unknown_token_is_not_found(client):
    assert client.get(reverse("seo-report-page", args=["nobody-abcdefghjk"])).status_code == 404
