import pytest

pytestmark = pytest.mark.django_db


def test_site_settings_are_publicly_readable(api_client):
    response = api_client.get("/api/site-settings/")
    assert response.status_code == 200
    data = response.json()
    assert data["licensing_price"] == "149.00"
    assert data["contracts_price"] == "99.00"
    assert data["complete_price"] == "199.00"
    assert data["seo_monthly_price"] == "499.00"
    assert data["seo_quarterly_price"] == "499.00"
    assert data["seo_yearly_price"] == "499.00"
    assert data["seo_oneoff_price"] == "550.00"
    assert data["hourly_rate"] == "150.00"
    assert data["discovery_hours"] == 3
    assert data["website_small_pages"] == 6
    assert data["website_small_page_price"] == "500.00"
    assert data["website_large_pages"] == 10
    assert data["website_large_page_price"] == "600.00"
    assert "website_connect_pages" not in data
    assert data["automation_from_price"] == "1200.00"


def test_site_settings_dashboard_requires_staff(api_client):
    response = api_client.get("/api/admin/site-settings/")
    assert response.status_code == 401


def test_staff_can_view_and_update_site_settings(api_client, staff_user):
    api_client.force_authenticate(staff_user)

    response = api_client.get("/api/admin/site-settings/")
    assert response.status_code == 200
    assert response.json()["licensing_price"] == "149.00"

    response = api_client.patch(
        "/api/admin/site-settings/",
        {
            "licensing_price": "163.90",
            "contracts_price": "108.90",
            "complete_price": "218.90",
            "seo_yearly_price": "199.00",
        },
        format="json",
    )
    assert response.status_code == 200
    assert response.json()["licensing_price"] == "163.90"
    assert response.json()["seo_yearly_price"] == "199.00"

    public_response = api_client.get("/api/site-settings/")
    assert public_response.json()["complete_price"] == "218.90"


def test_staff_can_update_service_prices(api_client, staff_user):
    api_client.force_authenticate(staff_user)

    response = api_client.patch(
        "/api/admin/site-settings/",
        {"hourly_rate": "165.00", "discovery_hours": 4, "website_large_pages": 12},
        format="json",
    )
    assert response.status_code == 200

    public = api_client.get("/api/site-settings/").json()
    assert public["hourly_rate"] == "165.00"
    assert public["discovery_hours"] == 4
    assert public["website_large_pages"] == 12


@pytest.mark.parametrize("field", ["discovery_hours", "website_small_pages"])
def test_a_count_must_be_at_least_one(api_client, staff_user, field):
    api_client.force_authenticate(staff_user)

    response = api_client.patch("/api/admin/site-settings/", {field: 0}, format="json")
    assert response.status_code == 400
    assert field in response.json()
