"""The customer account behind a sale, and the dashboard endpoints over it.

Mirrors allbikes' ``test_customer_account.py`` — the two products share the
account shape on purpose.
"""

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse

from freetheplatform.auth import lockout

from core.principal import principal
from sales.models import Sale
from sales.tests.factories.sale_factory import SaleFactory

pytestmark = pytest.mark.django_db

User = get_user_model()

COMPLETE_ENOUGH_TO_SEND = {
    "condition": Sale.Condition.USED,
    "make": "Honda",
    "model_name": "CB125F",
    "vehicle_price": 4500,
    "customer_name": "Alex Tran",
    "customer_email": "alex@example.com",
}


def send_url(sale):
    return reverse("dealer-sale-send", kwargs={"reference": sale.reference})


def _sent_sale(client, selling_dealer, **overrides):
    sale = SaleFactory(dealer=selling_dealer, **{**COMPLETE_ENOUGH_TO_SEND, **overrides})
    client.sign_in(selling_dealer.user)
    response = client.post(send_url(sale))
    assert response.status_code == 200, response.content
    sale.refresh_from_db()
    return sale


# --- creation at send --------------------------------------------------------


def test_the_first_send_creates_the_customer_account(client, selling_dealer, outbox):
    sale = _sent_sale(client, selling_dealer)

    user = User.objects.get(username="alex@example.com")
    assert not user.is_staff
    assert sale.account == user
    # The emailed password opens the account too, but only until they choose
    # their own — the login flags it as somebody else's choice.
    assert lockout.state_for(user).must_change_password
    assert "also signs into your FreeTheDesk account" in outbox[0].body_text
    assert principal(user)["role"] == "customer"


def test_the_emailed_password_opens_the_account(client, selling_dealer, outbox):
    sale = _sent_sale(client, selling_dealer)
    password = outbox[0].body_text.split("Password: ")[1].splitlines()[0].strip()
    assert sale.account.check_password(password)


def test_a_resend_never_touches_the_account_password(client, selling_dealer, outbox):
    """The sale password is re-minted on resend; the account's may by then be
    one the customer chose, so it is left alone — and the email stops claiming
    the two match."""
    sale = _sent_sale(client, selling_dealer)
    account_hash = User.objects.get(username="alex@example.com").password

    client.post(send_url(sale))

    sale.refresh_from_db()
    user = User.objects.get(username="alex@example.com")
    assert user.password == account_hash
    assert sale.account == user
    assert "also signs into your FreeTheDesk account" not in outbox[1].body_text


def test_an_existing_user_is_linked_untouched(client, selling_dealer):
    user = User.objects.create_user("alex@example.com", "alex@example.com", "TheirOwnPass1")
    sale = _sent_sale(client, selling_dealer)
    user.refresh_from_db()
    assert sale.account == user
    assert user.check_password("TheirOwnPass1")
    assert not lockout.state_for(user).must_change_password


# --- the account endpoints ---------------------------------------------------


def test_the_account_lists_only_its_own_sales(client, selling_dealer, outbox):
    mine = _sent_sale(client, selling_dealer)
    _sent_sale(client, selling_dealer, customer_email="other@example.com", customer_name="Other")

    client.sign_in(mine.account)
    response = client.get(reverse("account-sales"))

    assert response.status_code == 200
    sales = response.json()["sales"]
    assert [entry["reference"] for entry in sales] == [mine.reference]
    assert sales[0]["vehicle"].endswith("Honda CB125F")
    assert sales[0]["dealer_name"] == selling_dealer.business_name
    assert sales[0]["is_closed"] is False


def test_the_sale_list_requires_a_session(client):
    assert client.get(reverse("account-sales")).status_code in (401, 403)


def test_opening_a_sale_issues_its_access_cookie(client, selling_dealer, outbox):
    sale = _sent_sale(client, selling_dealer)
    client.sign_in(sale.account)

    response = client.post(reverse("account-sale-open", kwargs={"reference": sale.reference}))

    assert response.status_code == 200
    cookie = response.cookies[f"sale-access-{sale.reference}"]
    assert cookie.value == sale.access_token
    assert cookie["path"] == f"/api/sales/{sale.reference}/"
    # The cookie must actually open the sale.
    client.cookies[f"sale-access-{sale.reference}"] = cookie.value
    overview = client.get(reverse("sale-overview", kwargs={"reference": sale.reference}))
    assert overview.status_code == 200


def test_opening_someone_elses_sale_is_refused(client, selling_dealer, outbox):
    sale = _sent_sale(client, selling_dealer)
    stranger = User.objects.create_user("mallory@example.com", "mallory@example.com", "x")
    client.sign_in(stranger)
    response = client.post(reverse("account-sale-open", kwargs={"reference": sale.reference}))
    assert response.status_code == 404


def test_a_cancelled_sale_cannot_be_opened(client, selling_dealer, outbox):
    sale = _sent_sale(client, selling_dealer)
    sale.status = Sale.Status.CANCELLED
    sale.save(update_fields=["status"])
    client.sign_in(sale.account)
    response = client.post(reverse("account-sale-open", kwargs={"reference": sale.reference}))
    assert response.status_code == 403


def test_a_completed_sale_still_opens(client, selling_dealer, outbox):
    """Completion does not end access — the download the customer wants six
    months later is the one this exists to serve."""
    sale = _sent_sale(client, selling_dealer)
    sale.status = Sale.Status.COMPLETED
    sale.save(update_fields=["status"])
    client.sign_in(sale.account)
    response = client.post(reverse("account-sale-open", kwargs={"reference": sale.reference}))
    assert response.status_code == 200
