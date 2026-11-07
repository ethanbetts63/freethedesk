"""The report's link: the page and its PDF at /r/<business>-<token>, the opens it logs, and the page uploaded
with or after the report."""

from datetime import timedelta

import pytest
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from core.utils.urls import site_url
from seo.models import SeoProspect, SeoProspectOpen
from seo.tests.factories import PDF, SeoProspectFactory, upload_fields
from seo.utils.prospect_links import link_key, pdf_link, report_link
from seo.utils.prospect_sending import body_for, follow_up_body

pytestmark = pytest.mark.django_db

HTML = b"<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<title>Report</title>\n</head>\n<body>\n<article class=\"report\"><p>Fix the title.</p></article>\n</body>\n</html>\n"
PHONE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
PREVIEW_UA = "facebookexternalhit/1.1 Facebot Twitterbot/1.0"


def with_page(**fields):
    prospect = SeoProspectFactory(**fields)
    prospect.report_html.save(f"{prospect.slug}_r1.html", ContentFile(HTML), save=True)
    return prospect


# -- the page ----------------------------------------------------------------


def test_the_link_serves_the_report_page_noindexed_with_the_strip_and_the_ask(client):
    prospect = with_page(business="Perth Patio Magic")

    response = client.get(reverse("seo-report-page", args=[link_key(prospect)]), HTTP_USER_AGENT=PHONE_UA)

    assert response.status_code == 200
    assert response["Content-Type"].startswith("text/html")
    assert response["X-Robots-Tag"] == "noindex, nofollow, noarchive"
    assert set(response["Cache-Control"].split(", ")) == {"private", "no-store"}
    page = response.content.decode()
    assert '<meta name="robots" content="noindex, nofollow, noarchive">' in page
    assert 'class="ftd-bar__cta" href="https://www.freethedesk.com.au/seo"' in page
    assert "<p>Fix the title.</p>" in page
    assert page.index('class="ftd-bar"') < page.index("Fix the title") < page.index('class="ftd-ask"')
    # The site's footer closes the page.
    assert page.index('class="ftd-ask"') < page.index('class="ftd-foot"') < page.index("</body>")
    assert 'href="/seo">SEO audits</a>' in page and "ABN 11 493 753 896" in page
    assert f"/r/perth-patio-magic-{prospect.link_token}/pdf" in page
    assert 'href="tel:+61423853830"' in page and "0423 853 830" in page
    assert 'href="mailto:analytics@freethedesk.com.au"' in page


def test_the_ask_is_a_band_under_the_whole_report_before_the_footer():
    from seo.utils.prospect_links import page_document

    grid = HTML.decode().replace(
        '<article class="report"><p>Fix the title.</p></article>',
        '<div class="report-grid">\n<div class="cover-page"></div>\n<article class="report"><p>Fix the title.</p>'
        "</article>\n</div>",
    )
    page = page_document(SeoProspectFactory.build(business="Perth Patio Magic", link_token="t0k3n"), grid)
    assert page.index("</article>\n</div>") < page.index('class="ftd-ask"') < page.index('class="ftd-foot"')
    assert page.count('class="ftd-ask"') == 1
    assert 'src="https://www.freethedesk.com.au/images/guides/seo-cost-perth.webp"' in page
    assert ">Get the full SEO report, written from your own data</h2>" in page
    assert ">Explore SEO reports</a>" in page


def test_the_reports_trying_the_audit_picture_carry_it_in_place_of_the_guide_s():
    from seo.utils.prospect_links import AUDIT_PICTURE_TOKENS, page_document

    token = next(iter(AUDIT_PICTURE_TOKENS))
    page = page_document(SeoProspectFactory.build(business="Support Perth", link_token=token), HTML.decode())
    assert 'src="https://www.freethedesk.com.au/images/seo/what-google-looks-at.webp"' in page
    assert "seo-cost-perth.webp" not in page


def test_the_address_carries_the_business_s_name_before_the_token():
    prospect = SeoProspectFactory.build(business="Bedford Chiropractic Clinic", link_token="xufxp7pjfd")
    assert link_key(prospect) == "bedford-chiropractic-clinic-xufxp7pjfd"
    assert report_link(prospect) == f"{site_url()}/r/bedford-chiropractic-clinic-xufxp7pjfd"
    assert report_link(prospect, "text") == f"{site_url()}/r/bedford-chiropractic-clinic-xufxp7pjfd?s=text"
    assert pdf_link(prospect) == f"{site_url()}/r/bedford-chiropractic-clinic-xufxp7pjfd/pdf"
    # Punctuation and case go; a name that is nothing but them leaves the token alone; a long one is cut.
    assert link_key(SeoProspectFactory.build(business="Richo's Plumbing & Gas", link_token="t0k3n")) == "richos-plumbing-gas-t0k3n"
    assert link_key(SeoProspectFactory.build(business="***", link_token="t0k3n")) == "t0k3n"
    assert len(link_key(SeoProspectFactory.build(business="word " * 40, link_token="t0k3n"))) <= 60 + 1 + 5


def test_a_link_with_the_token_alone_or_under_another_name_is_sent_on_to_the_named_address(client):
    prospect = with_page(business="Perth Patio Magic")
    named = report_link(prospect)

    bare = client.get(reverse("seo-report-page", args=[prospect.link_token]) + "?s=text", HTTP_USER_AGENT=PHONE_UA)
    assert bare.status_code == 302 and bare["Location"] == f"{named}?s=text"
    assert bare["X-Robots-Tag"] == "noindex, nofollow, noarchive"
    other = client.get(reverse("seo-report-page", args=[f"another-name-{prospect.link_token}"]))
    assert other.status_code == 302 and other["Location"] == named
    pdf = client.get(reverse("seo-report-pdf", args=[prospect.link_token]))
    assert pdf.status_code == 302 and pdf["Location"] == pdf_link(prospect)
    # Sent on, not served: the open is logged once, at the named address.
    assert not SeoProspectOpen.objects.exists()
    assert client.get(named.replace(site_url(), "/api/seo").rstrip("/") + "/", HTTP_USER_AGENT=PHONE_UA).status_code == 200


def test_an_open_is_logged_with_its_source_and_whether_a_person_did_it(client):
    prospect = with_page()
    url = reverse("seo-report-page", args=[link_key(prospect)])

    client.get(url + "?s=text", HTTP_USER_AGENT=PHONE_UA)
    client.get(url + "?s=email", HTTP_USER_AGENT=PREVIEW_UA)
    client.get(url + "?s=anything-else", HTTP_USER_AGENT=PHONE_UA)
    client.get(url)

    opens = list(SeoProspectOpen.objects.filter(prospect=prospect).order_by("id"))
    assert [(o.source, o.likely_bot, o.kind) for o in opens] == [
        ("text", False, "page"), ("email", True, "page"), ("", False, "page"), ("", True, "page"),
    ]
    assert opens[0].user_agent == PHONE_UA


def test_the_pdf_is_served_inline_and_logged_as_its_own_kind(client):
    prospect = with_page()

    response = client.get(reverse("seo-report-pdf", args=[link_key(prospect)]) + "?s=dashboard",
                          HTTP_USER_AGENT=PHONE_UA)

    assert response.status_code == 200 and response["Content-Type"] == "application/pdf"
    assert response["Content-Disposition"].startswith("inline")
    assert b"".join(response.streaming_content) == PDF
    [opened] = SeoProspectOpen.objects.filter(prospect=prospect)
    assert (opened.kind, opened.source, opened.likely_bot) == ("pdf", "dashboard", False)


def test_a_row_from_before_the_page_existed_serves_its_pdf_at_the_link(client):
    prospect = SeoProspectFactory()  # no report_html

    response = client.get(reverse("seo-report-page", args=[link_key(prospect)]), HTTP_USER_AGENT=PHONE_UA)

    assert response.status_code == 200 and response["Content-Type"] == "application/pdf"
    assert SeoProspectOpen.objects.get(prospect=prospect).kind == "pdf"


def test_an_unknown_token_is_not_found_and_nothing_is_logged(client):
    assert client.get(reverse("seo-report-page", args=["nothinghere"])).status_code == 404
    assert client.get(reverse("seo-report-page", args=["some-name-nothinghere"])).status_code == 404
    assert client.get(reverse("seo-report-pdf", args=["nothinghere"])).status_code == 404
    assert not SeoProspectOpen.objects.exists()


def test_every_row_gets_its_own_unguessable_token():
    tokens = {SeoProspectFactory().link_token for _ in range(5)}
    assert len(tokens) == 5
    assert all(len(token) == 10 and set(token) <= set("abcdefghjkmnpqrstuvwxyz23456789") for token in tokens)


# -- the upload --------------------------------------------------------------


def upload(api_client, key, html=HTML, **overrides):
    data = {
        **upload_fields(**overrides),
        "report_pdf": SimpleUploadedFile("report.pdf", PDF, content_type="application/pdf"),
    }
    if html is not None:
        data["report_html"] = SimpleUploadedFile("report.html", html, content_type="text/html")
    return api_client.post(reverse("seo-prospect-upload"), data, format="multipart", HTTP_X_INTERNAL_API_KEY=key)


def test_a_report_uploads_with_its_page_and_answers_with_its_link(api_client, internal_key):
    response = upload(api_client, internal_key)

    assert response.status_code == 201
    prospect = SeoProspect.objects.get()
    assert response.json()["report_link"] == report_link(prospect) == f"{site_url()}/r/{link_key(prospect)}"
    assert report_link(prospect).endswith(f"-{prospect.link_token}")
    assert response.json()["report_html_ready"] is True
    with prospect.report_html.open("rb") as handle:
        assert handle.read() == HTML


def test_a_page_that_is_not_html_is_refused(api_client, internal_key):
    response = upload(api_client, internal_key, html=b"%PDF-1.7 not a page")
    assert response.status_code == 400 and "report_html" in response.json()
    assert not SeoProspect.objects.exists()


def test_a_report_that_went_by_hand_is_registered_sent_and_never_queued(api_client, internal_key):
    went = timezone.now() - timedelta(days=8)

    response = upload(api_client, internal_key, sent_at=went.isoformat(), subject_version=1, body_version=1,
                      body="Hi there,\n\nThe analyst's own words.")

    assert response.status_code == 201 and response.json()["outcome"] == "registered"
    prospect = SeoProspect.objects.get()
    assert prospect.sent_at == went and (prospect.subject_version, prospect.body_version) == (1, 1)
    assert prospect.body.startswith("Hi there")
    assert response.json()["report_link"] == report_link(prospect)


def test_a_report_that_went_by_hand_must_name_its_subject_and_body(api_client, internal_key):
    response = upload(api_client, internal_key, sent_at=timezone.now().isoformat())
    assert response.status_code == 400
    assert not SeoProspect.objects.exists()


def test_the_page_can_be_attached_to_a_report_uploaded_before_it_existed(api_client, internal_key):
    prospect = SeoProspectFactory()
    assert not prospect.report_html

    response = api_client.post(
        reverse("seo-prospect-html"),
        {"slug": prospect.slug, "report_html": SimpleUploadedFile("report.html", HTML, content_type="text/html")},
        format="multipart", HTTP_X_INTERNAL_API_KEY=internal_key,
    )

    assert response.status_code == 201 and response.json()["report_link"] == report_link(prospect)
    prospect.refresh_from_db()
    with prospect.report_html.open("rb") as handle:
        assert handle.read() == HTML
    # Attached again (a re-render after an edit): replaced, the link unchanged.
    again = api_client.post(
        reverse("seo-prospect-html"),
        {"slug": prospect.slug, "report_html": SimpleUploadedFile("report.html", HTML + b"<!-- v2 -->",
                                                                    content_type="text/html")},
        format="multipart", HTTP_X_INTERNAL_API_KEY=internal_key,
    )
    assert again.status_code == 201 and again.json()["report_link"] == report_link(prospect)
    prospect.refresh_from_db()
    with prospect.report_html.open("rb") as handle:
        assert handle.read().endswith(b"<!-- v2 -->")


def test_a_pdf_sent_with_the_page_replaces_the_one_the_link_serves(api_client, internal_key):
    prospect = with_page()
    printed = PDF + b"% v2"

    response = api_client.post(
        reverse("seo-prospect-html"),
        {"slug": prospect.slug, "report_html": SimpleUploadedFile("report.html", HTML, content_type="text/html"),
         "report_pdf": SimpleUploadedFile("report.pdf", printed, content_type="application/pdf")},
        format="multipart", HTTP_X_INTERNAL_API_KEY=internal_key,
    )

    assert response.status_code == 201 and response.json()["pdf_replaced"] is True
    prospect.refresh_from_db()
    with prospect.report_pdf.open("rb") as handle:
        assert handle.read() == printed
    # A page alone leaves the PDF as it was.
    alone = api_client.post(
        reverse("seo-prospect-html"),
        {"slug": prospect.slug, "report_html": SimpleUploadedFile("report.html", HTML, content_type="text/html")},
        format="multipart", HTTP_X_INTERNAL_API_KEY=internal_key,
    )
    assert alone.status_code == 201 and alone.json()["pdf_replaced"] is False
    prospect.refresh_from_db()
    with prospect.report_pdf.open("rb") as handle:
        assert handle.read() == printed


def test_a_pdf_sent_with_the_page_must_be_a_pdf(api_client, internal_key):
    prospect = with_page()
    response = api_client.post(
        reverse("seo-prospect-html"),
        {"slug": prospect.slug, "report_html": SimpleUploadedFile("report.html", HTML, content_type="text/html"),
         "report_pdf": SimpleUploadedFile("report.pdf", HTML, content_type="application/pdf")},
        format="multipart", HTTP_X_INTERNAL_API_KEY=internal_key,
    )
    assert response.status_code == 400 and "report_pdf" in response.json()


def test_attaching_a_page_takes_the_shared_secret_and_a_known_slug(api_client, internal_key):
    file = SimpleUploadedFile("report.html", HTML, content_type="text/html")
    assert api_client.post(reverse("seo-prospect-html"), {"slug": "nobody", "report_html": file},
                           format="multipart", HTTP_X_INTERNAL_API_KEY=internal_key).status_code == 404
    file = SimpleUploadedFile("report.html", HTML, content_type="text/html")
    assert api_client.post(reverse("seo-prospect-html"), {"slug": "nobody", "report_html": file},
                           format="multipart", HTTP_X_INTERNAL_API_KEY="wrong").status_code in (401, 403)


# -- the email ---------------------------------------------------------------


def test_the_report_email_names_the_page_beside_the_pdf_once_there_is_one():
    prospect = SeoProspectFactory(body_version=SeoProspect.Body.FIXES, issues=["Fix the title"],
                                  recommendation_count=9)
    assert "read it online" not in body_for(prospect)  # no page yet: the line is left out, nothing else moves

    prospect.report_html.save("p.html", ContentFile(HTML), save=True)
    body = body_for(prospect)

    assert f"You can also read it online, which is easier on a phone: {report_link(prospect, 'email')}" in body
    assert body.index("1. Fix the title") < body.index("read it online") < body.index("Forward the attached pdf")
    assert "?s=email" in body
    # The follow-up's link says it came from the follow-up.
    prospect.follow_up_body_version = SeoProspect.Body.FIXES
    assert "?s=follow-up" in follow_up_body(prospect) and "?s=email" not in follow_up_body(prospect)


# -- the dashboard -----------------------------------------------------------


def test_the_calls_list_shows_the_link_and_the_opens_by_people(api_client, staff_user, client):
    prospect = with_page(phone="0497 279 112")
    url = reverse("seo-report-page", args=[link_key(prospect)])
    client.get(url + "?s=text", HTTP_USER_AGENT=PHONE_UA)
    client.get(url + "?s=text", HTTP_USER_AGENT=PREVIEW_UA)
    client.get(url + "?s=email", HTTP_USER_AGENT=PHONE_UA)
    api_client.force_authenticate(staff_user)

    row = api_client.get(reverse("admin-seo-prospect-detail", args=[prospect.pk])).json()

    assert row["report_link"] == report_link(prospect) and row["report_html_ready"] is True
    assert row["opens"] == 2 and row["last_opened_at"] is not None
    listed = api_client.get(reverse("admin-seo-prospect-list")).json()["results"]
    assert [r["opens"] for r in listed] == [2]
