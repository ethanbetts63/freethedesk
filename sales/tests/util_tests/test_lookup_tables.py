"""The two lookup tables that have to cover their enum, asserted rather than trusted.

Both are keyed by a `TextChoices` member and both are read with `[...]` on a
live request path, so a member added without a row here is a 500 on the dealer's
queue or on a document list — not a missing label. The comments on both tables
already say a new member "has to be given an answer"; these are what makes that
true rather than hopeful.
"""

from documents.api import LABELS
from documents.models import SaleDocument
from sales.models import Sale
from sales.serializers.dealer_sale import WAITING_ON


def test_every_sale_status_says_who_it_is_waiting_on():
    assert set(WAITING_ON) == set(Sale.Status.values)


def test_every_sale_status_names_a_real_party():
    assert {party for party, _sentence in WAITING_ON.values()} <= {"dealer", "customer", "nobody"}


def test_every_document_kind_has_a_label():
    assert set(LABELS) == set(SaleDocument.Kind.values)
