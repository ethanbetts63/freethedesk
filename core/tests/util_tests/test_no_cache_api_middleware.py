from django.http import HttpResponse
from django.test import RequestFactory

from core.utils.middleware import NoCacheApiMiddleware


def _through(path, response):
    return NoCacheApiMiddleware(lambda request: response)(RequestFactory().get(path))


def test_api_answers_are_not_cached():
    response = _through("/api/seo/r/abc/", HttpResponse("page"))
    assert response["Cache-Control"] == "no-store, private"


def test_a_header_the_view_set_without_public_is_still_overridden():
    answer = HttpResponse("page")
    answer["Cache-Control"] = "max-age=600"
    assert _through("/api/anything/", answer)["Cache-Control"] == "no-store, private"


def test_a_public_file_the_view_marks_so_keeps_its_caching():
    """A report link's preview picture is fetched by chat and text apps apart from the page; one they cannot cache
    leaves the link bare."""
    picture = HttpResponse(b"\xff\xd8\xff", content_type="image/jpeg")
    picture["Cache-Control"] = "public, max-age=86400"
    assert _through("/api/seo/r/abc/cover.jpg/", picture)["Cache-Control"] == "public, max-age=86400"


def test_pages_outside_the_api_are_left_alone():
    assert "Cache-Control" not in _through("/reports/abc", HttpResponse("page"))
