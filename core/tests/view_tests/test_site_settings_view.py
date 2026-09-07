import pytest

from core.tests.factories import UserFactory

pytestmark = pytest.mark.django_db


def test_site_settings_are_publicly_readable(api_client):
    response = api_client.get("/api/site-settings/")
    assert response.status_code == 200
    data = response.json()
    assert data["licensing_price"] == "149.00"
    assert data["contracts_price"] == "99.00"
    assert data["complete_price"] == "199.00"
    assert data["seo_monthly_price"] == "99.00"
    assert data["seo_quarterly_price"] == "150.00"
    assert data["seo_biannual_price"] == "200.00"
    assert data["seo_oneoff_price"] == "250.00"
    assert data["gbp_audit_price"] == "100.00"


def test_site_settings_dashboard_requires_staff(api_client):
    response = api_client.get("/api/admin/site-settings/")
    assert response.status_code == 401


def test_staff_can_view_and_update_site_settings(api_client):
    staff = UserFactory(username="admin", is_staff=True)
    api_client.force_authenticate(staff)

    response = api_client.get("/api/admin/site-settings/")
    assert response.status_code == 200
    assert response.json()["licensing_price"] == "149.00"

    response = api_client.patch(
        "/api/admin/site-settings/",
        {"licensing_price": "163.90", "contracts_price": "108.90", "complete_price": "218.90", "seo_quarterly_price": "165.00"},
        format="json",
    )
    assert response.status_code == 200
    assert response.json()["licensing_price"] == "163.90"
    assert response.json()["seo_quarterly_price"] == "165.00"

    public_response = api_client.get("/api/site-settings/")
    assert public_response.json()["complete_price"] == "218.90"
