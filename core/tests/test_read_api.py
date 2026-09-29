"""The shared read API against this site's models and its MySQL.

Tenant-owned models refuse unscoped queries through their default manager; the
reader sees every dealer's rows, as a superuser does, without tripping that guard.
"""

from io import StringIO

import pytest
from django.core.management import call_command
from django.db import DatabaseError
from rest_framework.test import APIClient

from dealers.tests.factories import DealerFactory
from freetheplatform.readapi.readonly import read_only
from sales.models import Sale
from sales.tests.factories.sale_factory import SaleFactory


# The guard refuses to run inside a transaction it did not open.
pytestmark = pytest.mark.django_db(transaction=True)


@pytest.fixture
def api():
    call_command("readapi", "setup", "--username", "agent-reader", stdout=StringIO())
    out = StringIO()
    call_command("readapi", "token", "issue", "--username", "agent-reader", "--label", "tests", stdout=out)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {out.getvalue().strip().splitlines()[-1]}")
    return client


def test_mysql_refuses_a_write_inside_the_guard():
    with pytest.raises(DatabaseError):
        with read_only():
            DealerFactory()


def test_every_dealers_sales_are_read_and_their_credentials_are_not(api):
    SaleFactory()
    SaleFactory()
    models = {m["model"]: m for m in api.get("/api/read/models/").json()["models"]}
    assert models["sales.sale"]["count"] == 2
    fields = {f["name"] for f in models["sales.sale"]["fields"]}
    assert {"access_token", "access_password_hash"}.isdisjoint(fields)
    body = api.get("/api/read/records/?model=sales.sale&fields=id,dealer,customer_email").json()
    assert body["count"] == 2
    assert {row["dealer"]["id"] for row in body["results"]} == set(Sale.all_objects.values_list("dealer", flat=True))


def test_one_sale_in_full(api):
    sale = SaleFactory()
    body = api.get(f"/api/read/records/sales.sale/{sale.pk}/").json()
    assert body["record"]["customer_name"] == sale.customer_name
    assert "access_token" not in body["record"]
