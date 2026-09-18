"""Cookie-JWT is the only way into the API.

A Django session used to authenticate every endpoint alongside the access-token
cookie. That made it a second front door with its own lifetime, no revocation
path and nothing applying the login throttle to it — most visibly through the
admin login, which is not a DRF view and so was never throttled at all.

The route is gone and so is the authentication class. This test is what stops
either coming back quietly.
"""

import pytest

SITE_SETTINGS = "/api/admin/site-settings/"


@pytest.mark.django_db
def test_a_session_does_not_authenticate_the_api(client, staff_user):
    client.force_login(staff_user)

    response = client.get(SITE_SETTINGS)

    assert response.status_code in (401, 403)


@pytest.mark.django_db
def test_the_access_cookie_authenticates_the_api(client, staff_user):
    client.sign_in(staff_user)

    response = client.get(SITE_SETTINGS)

    assert response.status_code == 200
