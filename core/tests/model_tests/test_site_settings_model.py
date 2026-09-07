import pytest

from core.models import SiteSettings

pytestmark = pytest.mark.django_db


def test_site_settings_are_a_singleton():
    first = SiteSettings.load()
    second = SiteSettings.load()
    assert first.pk == second.pk
    assert SiteSettings.objects.count() == 1
