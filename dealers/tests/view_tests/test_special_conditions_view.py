"""Per-clause approval of the Special Conditions.

The tests that matter here are the ones about SC2 and SC6. The interface will
not offer a switch for them; these check the API refuses anyway, because an
interface rule is one a request walks straight past.
"""

import pytest
from django.urls import reverse
from freetheplatform.agreements import Acceptance

from dealers.models import Dealer, DealerProfile
from dealers.utils import special_conditions

pytestmark = pytest.mark.django_db

URL = reverse("dealer-special-conditions")


def full_choices(**overrides):
    defaults = {condition.number: True for condition in special_conditions.DEFAULT_CONDITIONS}
    defaults.update(overrides)
    return {"defaults": defaults, "additions": []}


@pytest.fixture
def contracting_dealer(dealer):
    """A dealer whose plan actually produces a contract."""
    dealer.plan = Dealer.Plan.COMPLETE
    dealer.save(update_fields=["plan"])
    return dealer


# --- reading ----------------------------------------------------------------


def test_the_dealer_reads_every_clause_in_full(client, contracting_dealer):
    """Not a summary. They are deciding whether to keep each one, and a decision
    made against a one-line description is not the approval this records."""
    client.sign_in(contracting_dealer.user)

    payload = client.get(URL).json()

    assert payload["version"] == special_conditions.VERSION
    assert len(payload["conditions"]) == len(special_conditions.DEFAULT_CONDITIONS)
    sc1 = next(row for row in payload["conditions"] if row["number"] == "SC1")
    assert "Clause 4.4 provides" in sc1["paragraphs"][0]
    assert sc1["kept"] is True


def test_a_per_sale_value_reads_as_a_sentence_rather_than_a_placeholder(client, contracting_dealer):
    client.sign_in(contracting_dealer.user)

    payload = client.get(URL).json()

    sc1 = next(row for row in payload["conditions"] if row["number"] == "SC1")
    assert "[the delivery address for that sale]" in sc1["paragraphs"]
    assert "{delivery_address}" not in " ".join(sc1["paragraphs"])


def test_the_two_that_cannot_be_removed_say_so(client, contracting_dealer):
    client.sign_in(contracting_dealer.user)

    payload = client.get(URL).json()

    removable = {row["number"]: row["removable"] for row in payload["conditions"]}
    assert removable["SC2"] is False
    assert removable["SC6"] is False
    assert removable["SC5"] is True


def test_there_is_no_sc8(client, contracting_dealer):
    """Deliberate, and the gap in the numbering is deliberate too: a contract
    from either system stays comparable clause by clause."""
    client.sign_in(contracting_dealer.user)

    numbers = [row["number"] for row in client.get(URL).json()["conditions"]]

    assert "SC8" not in numbers
    assert numbers == ["SC1", "SC2", "SC3", "SC4", "SC5", "SC6", "SC7", "SC9", "SC10"]


def test_a_dealer_who_has_never_opened_the_screen_keeps_everything(client, contracting_dealer):
    client.sign_in(contracting_dealer.user)

    payload = client.get(URL).json()

    assert all(row["kept"] for row in payload["conditions"])


# --- saving -----------------------------------------------------------------


def test_removing_a_clause_writes_both_the_column_and_the_acceptance(client, contracting_dealer):
    client.sign_in(contracting_dealer.user)

    response = client.put(URL, full_choices(SC5=False), content_type="application/json")

    assert response.status_code == 200
    profile = DealerProfile.objects.get(dealer=contracting_dealer)
    assert profile.condition_choices["defaults"]["SC5"] is False

    acceptance = Acceptance.objects.get()
    assert acceptance.accepted_by == contracting_dealer.user
    assert acceptance.context["defaults"]["SC5"] is False
    assert acceptance.context["catalogue_version"] == special_conditions.VERSION


def test_the_statement_recorded_is_the_one_shown(client, contracting_dealer):
    client.sign_in(contracting_dealer.user)
    shown = client.get(URL).json()["statement"]

    client.put(URL, full_choices(), content_type="application/json")

    assert Acceptance.objects.get().statement == shown


def test_the_published_version_is_the_one_accepted(client, contracting_dealer):
    client.sign_in(contracting_dealer.user)

    client.put(URL, full_choices(), content_type="application/json")

    version = Acceptance.objects.get().agreement_version
    assert version.version == special_conditions.VERSION
    assert version.agreement.key == special_conditions.AGREEMENT_KEY
    # The published text is the clause wording itself, not a description of it.
    assert "Clause 4.4 provides" in version.content


@pytest.mark.parametrize("number", ["SC2", "SC6"])
def test_a_required_clause_cannot_be_removed_through_the_api(client, contracting_dealer, number):
    client.sign_in(contracting_dealer.user)

    response = client.put(URL, full_choices(**{number: False}), content_type="application/json")

    assert response.status_code == 400
    assert number in str(response.json())
    profile = DealerProfile.objects.filter(dealer=contracting_dealer).first()
    assert profile is None or profile.condition_choices == {}


def test_a_clause_that_is_not_in_the_contract_is_refused(client, contracting_dealer):
    client.sign_in(contracting_dealer.user)

    response = client.put(URL, full_choices(SC8=True), content_type="application/json")

    assert response.status_code == 400
    assert "SC8" in str(response.json())


def test_the_dealer_may_add_their_own_clause(client, contracting_dealer):
    """Accepted as written. Nothing reviews it, validates it or comments on
    it — the moment the product has an opinion about which clause suits their
    business it has crossed into advising them."""
    client.sign_in(contracting_dealer.user)

    response = client.put(
        URL,
        {
            **full_choices(),
            "additions": [
                {
                    "heading": "Card deposits",
                    "paragraphs": ["Any card processing fee is not refundable."],
                }
            ],
        },
        content_type="application/json",
    )

    assert response.status_code == 200
    assert response.json()["additions"] == [
        {"heading": "Card deposits", "paragraphs": ["Any card processing fee is not refundable."]}
    ]


def test_a_licensing_only_dealer_has_nothing_to_choose(client, dealer):
    """They have no Schedule 5 contract. The Authority to Lodge carries the same
    authority and is not negotiable."""
    dealer.plan = Dealer.Plan.LICENSING
    dealer.save(update_fields=["plan"])
    client.sign_in(dealer.user)

    assert client.put(URL, full_choices(), content_type="application/json").status_code == 409


def test_an_anonymous_caller_is_refused(client):
    assert client.get(URL).status_code == 401


def test_a_clause_added_since_the_dealer_last_saved_defaults_to_kept(client, contracting_dealer):
    """The honest reading of a clause missing from their stored map is that they
    have never seen it, which is the same position as a dealer who has not
    opened the screen."""
    DealerProfile.objects.create(
        dealer=contracting_dealer,
        condition_choices={"defaults": {"SC1": False}, "additions": []},
    )
    client.sign_in(contracting_dealer.user)

    kept = {row["number"]: row["kept"] for row in client.get(URL).json()["conditions"]}

    assert kept["SC1"] is False
    assert kept["SC9"] is True
