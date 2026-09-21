"""Which documents a sale produces, and how to build one unsigned.

The document set is a function of the plan and the stock type, and nothing else.
See `_docs/licensing/plan/02-sale-flow.md`.

| Document                     | Licensing | Contracts | Both | Stock |
| ---------------------------- | --------- | --------- | ---- | ----- |
| Authority to Lodge           | yes       | —         | —    | Both  |
| Vehicle Sale Contract        | —         | yes       | yes  | Both  |
| Licensing form (VL17 / MR9B) | yes       | —         | yes  | Both  |

The Authority to Lodge is on the licensing-only plan alone because it exists to
carry SC2 for a dealer who has no contract for SC2 to live in. A dealer on the
complete plan gets the clause where it belongs, on the face of the contract, and
a second instrument saying the same thing would be two authorities to reconcile.

**Nothing here is written to disk.** A filled form carries a licence number and
a date of birth, so it is built on demand and streamed. Only a *signed* document
persists, and that is the signing step's job.
"""

from dataclasses import dataclass

from dealers.models import Dealer
from dealers.utils.services import ensure_dealer_profile
from documents.models import SaleDocument
from documents.render.authority import build_authority_to_lodge
from documents.render.contract import build_sale_contract
from documents.render.prescribed import build_licensing_form


@dataclass(frozen=True)
class BuiltDocument:
    filename: str
    content: bytes
    #: The published form version this was built from, for a prescribed form.
    #: Empty for the contract and the Authority to Lodge, which have no
    #: template — the regulations are their source and they change on a slower
    #: and different clock.
    template_version: str = ""


Kind = SaleDocument.Kind


def document_kinds_for(sale) -> list[str]:
    kinds = []
    if sale.produces_contract:
        kinds.append(Kind.SALE_CONTRACT)
    if sale.produces_licensing:
        kinds.append(Kind.LICENSING_FORM)
        if sale.produces == Dealer.Plan.LICENSING:
            kinds.append(Kind.AUTHORITY_TO_LODGE)
    return kinds


def build_unsigned(sale, kind) -> BuiltDocument:
    """Build one of this sale's documents, with its signature lines blank.

    Blank because clause 1.1 makes signing the Purchaser's offer, and
    pre-signing on their behalf would forge the one act the clause is about.
    This is what every download from either portal produces.

    The renderers below all take signature arguments, which is how the signing
    step will produce the final copy. Nothing passes them yet, so nothing here
    pretends to: a parameter with no caller is a guess about the future, and an
    untested branch is where a bug waits.
    """
    if kind not in document_kinds_for(sale):
        raise ValueError(f"{sale.reference} does not produce a {kind}.")

    dealer = sale.dealer
    profile = ensure_dealer_profile(dealer)

    if kind == Kind.SALE_CONTRACT:
        filename, content = build_sale_contract(sale, dealer, profile)
        return BuiltDocument(filename, content)

    if kind == Kind.AUTHORITY_TO_LODGE:
        filename, content = build_authority_to_lodge(sale, dealer, profile)
        return BuiltDocument(filename, content)

    filename, template, content = build_licensing_form(sale, dealer, profile)
    return BuiltDocument(filename, content, template_version=template.version_label)
