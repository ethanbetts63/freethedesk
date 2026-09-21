"""The customer's own side of a sale.

The access tests are the point of this file. A member of the public with no
account reaches a record holding a date of birth, a driver's licence number and
a residential address, and the only thing between them and somebody else's is a
cookie scoped to one path.
"""

from datetime import date, timedelta

import pytest
from django.urls import reverse
from django.utils import timezone

from dealers.models import Dealer
from dealers.tests.factories import DealerProfileFactory
from documents.tests.factories import load_current_templates
from sales.models import Sale, SaleEvent
from sales.tests.factories import SaleFactory
from sales.utils.access import cookie_name, set_access_password
from sales.views.customer import SaleLoginIPThrottle, SaleLoginThrottle

pytestmark = pytest.mark.django_db


def url(name, sale, **kwargs):
    return reverse(name, kwargs={"reference": sale.reference, **kwargs})


def sent_sale(dealer, **overrides):
    defaults = {
        "produces": Dealer.Plan.COMPLETE,
        "status": Sale.Status.AWAITING_CUSTOMER,
        "vehicle_price": 4500,
        "customer_name": "Alex Tran",
        "customer_email": "alex@example.com",
    }
    sale = SaleFactory(dealer=dealer, **{**defaults, **overrides})
    sale.apply_pricing()
    sale.save(update_fields=["balance_amount"])
    return sale


def hold_cookie(client, sale):
    """Give the test client the capability the redeem endpoint would set."""
    client.cookies[cookie_name(sale.reference)] = sale.access_token
    return client


# --- redeeming the link -----------------------------------------------------


def test_the_link_redeems_for_a_cookie(client, selling_dealer):
    sale = sent_sale(selling_dealer)

    response = client.post(
        url("sale-redeem", sale),
        {"access_token": sale.access_token},
        content_type="application/json",
    )

    assert response.status_code == 200
    assert response.json()["reference"] == sale.reference
    cookie = response.cookies[cookie_name(sale.reference)]
    assert cookie.value == sale.access_token


def test_the_cookie_is_httponly_and_scoped_to_this_sale(client, selling_dealer):
    """Scoped to this sale's own path so one sale's cookie is never offered up
    with a request about another, and httpOnly because nothing in the page needs
    to read it."""
    sale = sent_sale(selling_dealer)

    response = client.post(
        url("sale-redeem", sale),
        {"access_token": sale.access_token},
        content_type="application/json",
    )

    cookie = response.cookies[cookie_name(sale.reference)]
    assert cookie["httponly"] is True
    assert cookie["path"] == f"/api/sales/{sale.reference}/"
    assert cookie["samesite"] == "Lax"


def test_the_cookie_is_secure_under_production_settings(client, selling_dealer, settings):
    settings.SESSION_COOKIE_SECURE = True
    sale = sent_sale(selling_dealer)

    response = client.post(
        url("sale-redeem", sale),
        {"access_token": sale.access_token},
        content_type="application/json",
    )

    assert response.cookies[cookie_name(sale.reference)]["secure"] is True


def test_a_wrong_token_is_refused(client, selling_dealer):
    sale = sent_sale(selling_dealer)

    response = client.post(
        url("sale-redeem", sale), {"access_token": "nonsense"}, content_type="application/json"
    )

    assert response.status_code == 403


def test_a_reference_that_does_not_exist_answers_the_same_as_a_wrong_token(client, selling_dealer):
    """Distinguishing them would turn this into a way to find out which
    references are real."""
    sale = sent_sale(selling_dealer)
    real = client.post(
        url("sale-redeem", sale), {"access_token": "nonsense"}, content_type="application/json"
    )
    imaginary = client.post(
        reverse("sale-redeem", kwargs={"reference": "S-NOTREAL"}),
        {"access_token": "nonsense"},
        content_type="application/json",
    )

    assert real.status_code == imaginary.status_code == 403
    assert real.json() == imaginary.json()


def test_a_cancelled_sale_cannot_be_opened(client, selling_dealer):
    sale = sent_sale(selling_dealer, status=Sale.Status.CANCELLED)

    response = client.post(
        url("sale-redeem", sale),
        {"access_token": sale.access_token},
        content_type="application/json",
    )

    assert response.status_code == 403


def test_a_completed_sale_stays_reachable(client, selling_dealer):
    """The signed documents are theirs, and the download they want six months
    later is the one this exists to serve."""
    sale = sent_sale(selling_dealer, status=Sale.Status.COMPLETED)

    response = client.post(
        url("sale-redeem", sale),
        {"access_token": sale.access_token},
        content_type="application/json",
    )

    assert response.status_code == 200


# --- recovery ---------------------------------------------------------------


def test_the_reference_and_password_recover_the_cookie(client, selling_dealer):
    sale = sent_sale(selling_dealer)
    password = set_access_password(sale)

    response = client.post(
        url("sale-login", sale), {"password": password}, content_type="application/json"
    )

    assert response.status_code == 200
    assert response.cookies[cookie_name(sale.reference)].value == sale.access_token


def test_a_wrong_password_is_refused(client, selling_dealer):
    sale = sent_sale(selling_dealer)
    set_access_password(sale)

    response = client.post(
        url("sale-login", sale), {"password": "wrong"}, content_type="application/json"
    )

    assert response.status_code == 403


def test_a_sale_with_no_password_set_cannot_be_logged_into(client, selling_dealer):
    """An empty hash must not match an empty password."""
    sale = sent_sale(selling_dealer)

    response = client.post(
        url("sale-login", sale), {"password": ""}, content_type="application/json"
    )

    assert response.status_code == 403


# --- lockout ----------------------------------------------------------------
#
# The throttles above cap cost. These are the control: a durable counter on the
# sale, not a cache entry a deploy empties.


def attempt(client, sale, password="wrong"):
    return client.post(
        url("sale-login", sale), {"password": password}, content_type="application/json"
    )


def test_failed_attempts_lock_the_sale_at_the_shared_threshold(
    client, selling_dealer, settings
):
    """The same number the staff login uses, read from the same setting."""
    settings.FTP_AUTH = {**settings.FTP_AUTH, "LOCKOUT_THRESHOLD": 3}
    sale = sent_sale(selling_dealer)
    password = set_access_password(sale)

    for _ in range(3):
        assert attempt(client, sale).status_code == 403

    sale.refresh_from_db()
    assert sale.access_failure_count == 3
    assert sale.access_locked_until is not None
    # The right password is refused too, which is the whole point of a lockout.
    assert attempt(client, sale, password).status_code == 403


def test_the_lock_expires_and_the_next_attempt_clears_it(
    client, selling_dealer, settings
):
    """Reading is what unlocks. A lock with no end is a denial of service on the
    customer's own sale."""
    settings.FTP_AUTH = {**settings.FTP_AUTH, "LOCKOUT_THRESHOLD": 1}
    sale = sent_sale(selling_dealer)
    password = set_access_password(sale)
    attempt(client, sale)

    sale.refresh_from_db()
    sale.access_locked_until = timezone.now() - timedelta(seconds=1)
    sale.save(update_fields=["access_locked_until"])

    assert attempt(client, sale, password).status_code == 200
    sale.refresh_from_db()
    assert sale.access_failure_count == 0
    assert sale.access_locked_until is None


def test_a_success_forgets_the_failures_before_it(client, selling_dealer, settings):
    settings.FTP_AUTH = {**settings.FTP_AUTH, "LOCKOUT_THRESHOLD": 10}
    sale = sent_sale(selling_dealer)
    password = set_access_password(sale)
    attempt(client, sale)
    attempt(client, sale)

    assert attempt(client, sale, password).status_code == 200
    sale.refresh_from_db()
    assert sale.access_failure_count == 0


def test_a_reference_that_does_not_exist_answers_the_same_way(client, selling_dealer):
    """One sentence for every failure, and a hash spent either way, so this is
    not a way of finding out which references are real."""
    sale = sent_sale(selling_dealer)
    set_access_password(sale)

    real = attempt(client, sale)
    fake = client.post(
        reverse("sale-login", kwargs={"reference": "NOSUCHREF"}),
        {"password": "wrong"},
        content_type="application/json",
    )

    assert real.status_code == fake.status_code == 403
    assert real.json() == fake.json()


def tighten(monkeypatch, throttle, rate):
    """Set one throttle's rate for the duration of a test.

    On the class rather than through `settings.REST_FRAMEWORK`. DRF snapshots
    `DEFAULT_THROTTLE_RATES` onto `SimpleRateThrottle.THROTTLE_RATES` at import,
    so a settings override reaches it inconsistently — it appeared to work and
    then stopped working depending on test order, which is the worst way for a
    rate limit to be tested. `rate` on the class is the documented lever and
    `SimpleRateThrottle.__init__` honours it.
    """
    monkeypatch.setattr(throttle, "rate", rate, raising=False)


def test_the_login_throttle_is_keyed_on_the_sale_rather_than_the_caller(
    client, selling_dealer, monkeypatch
):
    """The reference is effectively the username here, and the address is not
    the thing being attacked. Keying on the address alone lets anyone with a
    modest pool of them make unlimited attempts at one sale."""
    tighten(monkeypatch, SaleLoginThrottle, "2/hour")
    tighten(monkeypatch, SaleLoginIPThrottle, "1000/hour")
    one = sent_sale(selling_dealer)
    two = sent_sale(selling_dealer)

    for _ in range(2):
        client.post(url("sale-login", one), {"password": "x"}, content_type="application/json")

    spent = client.post(
        url("sale-login", one), {"password": "x"}, content_type="application/json"
    )
    other = client.post(
        url("sale-login", two), {"password": "x"}, content_type="application/json"
    )

    assert spent.status_code == 429
    # The same caller still reaches a different sale, because that sale's own
    # allowance has not been touched. A shared office NAT must not lock its own
    # customers out of unrelated sales.
    assert other.status_code == 403


def test_the_second_throttle_bounds_one_source_across_many_references(
    client, selling_dealer, monkeypatch
):
    """The other half of the pair. Without it, a botnet gets free rein on a
    single reference — the same mistake made from the opposite end."""
    tighten(monkeypatch, SaleLoginThrottle, "1000/hour")
    tighten(monkeypatch, SaleLoginIPThrottle, "2/hour")
    sales = [sent_sale(selling_dealer) for _ in range(3)]

    codes = [
        client.post(
            url("sale-login", sale), {"password": "x"}, content_type="application/json"
        ).status_code
        for sale in sales
    ]

    assert codes == [403, 403, 429]


# --- what the cookie reaches ------------------------------------------------


def test_the_customer_reads_their_own_sale(client, selling_dealer):
    sale = sent_sale(selling_dealer)
    hold_cookie(client, sale)

    payload = client.get(url("sale-overview", sale)).json()

    assert payload["reference"] == sale.reference
    assert payload["dealer_name"] == "Bikes WA"
    assert payload["requirements"]["next_action"] == "details"


def test_no_cookie_is_refused(client, selling_dealer):
    sale = sent_sale(selling_dealer)

    assert client.get(url("sale-overview", sale)).status_code == 403


def test_a_valid_link_for_one_sale_grants_nothing_on_another(client, selling_dealer):
    """The cookie is named and path-scoped per sale, so this is belt and braces
    — and it is the assertion that would catch either of those being relaxed."""
    mine = sent_sale(selling_dealer)
    theirs = sent_sale(selling_dealer)
    client.cookies[cookie_name(theirs.reference)] = mine.access_token

    assert client.get(url("sale-overview", theirs)).status_code == 403


def test_a_token_from_another_sale_under_the_right_cookie_name_is_refused(client, selling_dealer):
    mine = sent_sale(selling_dealer)
    theirs = sent_sale(selling_dealer)
    client.cookies[cookie_name(mine.reference)] = theirs.access_token

    assert client.get(url("sale-overview", mine)).status_code == 403


def test_the_customer_sees_none_of_the_dealers_own_business(client, selling_dealer):
    DealerProfileFactory(dealer=selling_dealer, bank_account_number="12345678")
    sale = sent_sale(selling_dealer)
    hold_cookie(client, sale)

    payload = client.get(url("sale-overview", sale)).json()

    assert "bank_account_number" not in str(payload)
    assert "staff_notes" not in payload
    assert "stock_number" not in payload


def test_every_response_says_not_to_cache_it(client, selling_dealer):
    """It matters more here than anywhere else in the product: these pages show
    a date of birth and a licence number."""
    sale = sent_sale(selling_dealer)
    hold_cookie(client, sale)

    response = client.get(url("sale-overview", sale))

    assert response["Cache-Control"] == "no-store, private"


# --- Fill -------------------------------------------------------------------


COMPLETE_DETAILS = {
    "licence_family_name": "Tran",
    "licence_given_names": "Alex",
    "licence_number": "1234567",
    "licence_date_of_birth": "1990-11-05",
    "licensee_address_line1": "12 Example Street",
    "licensee_suburb": "Fremantle",
    "licensee_postcode": "6160",
}


def test_the_customer_fills_in_their_licence_details(client, selling_dealer):
    sale = sent_sale(selling_dealer, fulfilment_method=Sale.Fulfilment.PICKUP)
    hold_cookie(client, sale)

    response = client.patch(
        url("sale-details", sale), COMPLETE_DETAILS, content_type="application/json"
    )

    assert response.status_code == 200
    sale.refresh_from_db()
    assert sale.licence_number == "1234567"
    assert sale.licence_date_of_birth == date(1990, 11, 5)
    assert response.json()["requirements"]["details_complete"] is True


def test_filling_in_details_stamps_what_staleness_is_measured_against(client, selling_dealer):
    sale = sent_sale(selling_dealer, fulfilment_method=Sale.Fulfilment.PICKUP)
    hold_cookie(client, sale)

    client.patch(url("sale-details", sale), COMPLETE_DETAILS, content_type="application/json")

    sale.refresh_from_db()
    assert sale.details_updated_at is not None


def test_a_change_is_recorded_against_the_sale(client, selling_dealer):
    """The customer holds a capability, not an identity, so there is no user row
    to point at and the label is the only honest answer."""
    sale = sent_sale(selling_dealer, fulfilment_method=Sale.Fulfilment.PICKUP)
    hold_cookie(client, sale)

    client.patch(url("sale-details", sale), COMPLETE_DETAILS, content_type="application/json")

    event = SaleEvent.objects.for_sale(sale).get(kind="details.updated")
    assert event.actor is None
    assert event.actor_label == "Alex Tran (customer)"
    assert "licence_number" in event.context["fields"]


def test_the_customer_cannot_write_a_field_that_is_not_theirs(client, selling_dealer):
    """A stock number is displayed nowhere on their screen and writable nowhere
    either. Naming the writable set rather than inferring it is what keeps a new
    column from silently becoming public."""
    sale = sent_sale(selling_dealer, stock_number="STK-1")
    hold_cookie(client, sale)

    client.patch(
        url("sale-details", sale),
        {"stock_number": "TAMPERED", "vehicle_price": "1.00", "status": "completed"},
        content_type="application/json",
    )

    sale.refresh_from_db()
    assert sale.stock_number == "STK-1"
    assert str(sale.vehicle_price) == "4500.00"
    assert sale.status == Sale.Status.AWAITING_CUSTOMER


@pytest.mark.parametrize("value", ["61", "616012", "ABCD"])
def test_a_postcode_that_is_not_four_digits_is_refused(client, selling_dealer, value):
    sale = sent_sale(selling_dealer)
    hold_cookie(client, sale)

    response = client.patch(
        url("sale-details", sale),
        {"licensee_postcode": value},
        content_type="application/json",
    )

    assert response.status_code == 400


def test_half_a_company_is_refused(client, selling_dealer):
    """A form carrying a company name and no ACN produces an application the
    Department will reject, and the customer finds out weeks later."""
    sale = sent_sale(selling_dealer)
    hold_cookie(client, sale)

    response = client.patch(
        url("sale-details", sale),
        {"licensed_to_company": True, "company_name": "Acme Pty Ltd"},
        content_type="application/json",
    )

    assert response.status_code == 400
    assert "company_acn" in response.json()


def test_a_purchaser_who_is_not_the_licence_holder_has_to_name_themselves(client, selling_dealer):
    sale = sent_sale(selling_dealer)
    hold_cookie(client, sale)

    response = client.patch(
        url("sale-details", sale),
        {"purchaser_is_licence_holder": False},
        content_type="application/json",
    )

    assert response.status_code == 400
    assert "purchaser_family_name" in response.json()


def test_a_delivery_needs_its_address_before_the_details_are_complete(client, selling_dealer):
    sale = sent_sale(selling_dealer, fulfilment_method=Sale.Fulfilment.DELIVERY)
    hold_cookie(client, sale)

    response = client.patch(
        url("sale-details", sale), COMPLETE_DETAILS, content_type="application/json"
    )

    assert response.json()["requirements"]["details_complete"] is False


# --- the warranty gate ------------------------------------------------------


def test_the_customer_acknowledges_the_warranty_notice(client, selling_dealer):
    sale = sent_sale(selling_dealer, condition=Sale.Condition.USED, year=2024, odometer_km=9000)
    hold_cookie(client, sale)
    key = client.get(url("sale-overview", sale)).json()["warranty"]["acknowledgement_key"]

    response = client.post(
        url("sale-warranty", sale),
        {"acknowledgement_key": key},
        content_type="application/json",
    )

    assert response.status_code == 200
    assert response.json()["warranty"]["acknowledged"] is True
    assert SaleEvent.objects.for_sale(sale).filter(kind="warranty.acknowledged").exists()


def test_acknowledging_a_notice_that_has_since_changed_is_refused(client, selling_dealer):
    """The failure it prevents is a customer who acknowledged that a statutory
    warranty applied and then bought a vehicle where it does not."""
    sale = sent_sale(selling_dealer, condition=Sale.Condition.USED, year=2024, odometer_km=9000)
    hold_cookie(client, sale)
    stale_key = client.get(url("sale-overview", sale)).json()["warranty"]["acknowledgement_key"]

    sale.vehicle_price = 1500
    sale.save(update_fields=["vehicle_price"])

    response = client.post(
        url("sale-warranty", sale),
        {"acknowledgement_key": stale_key},
        content_type="application/json",
    )

    assert response.status_code == 409
    sale.refresh_from_db()
    assert sale.warranty_acknowledged_at is None


def test_an_edit_after_acknowledgement_stops_it_counting(client, selling_dealer):
    sale = sent_sale(selling_dealer, condition=Sale.Condition.USED, year=2024, odometer_km=9000)
    hold_cookie(client, sale)
    key = client.get(url("sale-overview", sale)).json()["warranty"]["acknowledgement_key"]
    client.post(
        url("sale-warranty", sale), {"acknowledgement_key": key}, content_type="application/json"
    )

    sale.vehicle_price = 9000
    sale.save(update_fields=["vehicle_price"])

    assert client.get(url("sale-overview", sale)).json()["warranty"]["acknowledged"] is False


def test_the_customer_can_read_the_prescribed_form(client, selling_dealer):
    load_current_templates()
    sale = sent_sale(selling_dealer, condition=Sale.Condition.USED, year=2024, odometer_km=9000)
    hold_cookie(client, sale)

    response = client.get(url("sale-warranty-notice", sale))

    assert response.status_code == 200
    assert response["Content-Type"] == "application/pdf"


def test_the_customer_can_read_a_document_before_signing_it(client, selling_dealer):
    DealerProfileFactory(dealer=selling_dealer)
    sale = sent_sale(selling_dealer, **{k: v for k, v in COMPLETE_DETAILS.items() if k != "licence_date_of_birth"})
    hold_cookie(client, sale)

    response = client.get(url("sale-document", sale, kind="sale_contract"))

    assert response.status_code == 200
    assert response.content.startswith(b"%PDF")


def test_a_document_this_sale_does_not_produce_is_not_reachable(client, selling_dealer):
    sale = sent_sale(selling_dealer, produces=Dealer.Plan.CONTRACTS)
    hold_cookie(client, sale)

    assert client.get(url("sale-document", sale, kind="licensing_form")).status_code == 404


# --- the requirements engine at the request layer ---------------------------


def test_the_dealer_and_the_customer_read_the_same_requirements(client, selling_dealer):
    """One source of truth, two audiences. Two implementations of "can they sign
    yet" disagree eventually, and the way it surfaces is a customer shown a
    button that returns 409."""
    from sales.requirements import customer_requirements

    sale = sent_sale(selling_dealer, fulfilment_method=Sale.Fulfilment.PICKUP)
    hold_cookie(client, sale)

    payload = client.get(url("sale-overview", sale)).json()

    assert payload["requirements"] == {
        key: value for key, value in customer_requirements(sale).items()
    }
