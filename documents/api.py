"""What a screen needs to render a sale's document list.

Shared by the dealer's sale page and the customer's own, because they are the
same list read by two audiences. Building it twice is how a customer comes to be
shown a document the dealer's page says does not exist yet.

Every row offers the unsigned version always and the signed version once there
is one. They answer different questions: the unsigned copy is what gets printed
when something has to be done by hand or a customer wants to read it on paper,
and the signed one is the record. A stale signed document is labelled stale
rather than hidden — the dealer needs to know it exists and why it no longer
counts, and the customer needs to be sent back to sign rather than left thinking
they are finished.
"""

from documents.build import document_kinds_for
from documents.models import SaleDocument

LABELS = {
    SaleDocument.Kind.SALE_CONTRACT: "Vehicle Sale Contract",
    SaleDocument.Kind.LICENSING_FORM: "Licensing form",
    SaleDocument.Kind.AUTHORITY_TO_LODGE: "Authority to Lodge",
}


def document_rows(sale):
    # `select_related("sale")` because `is_stale` reads `document.sale`, and
    # without it every row on the page fetched the same sale again.
    signed = {
        document.kind: document
        for document in SaleDocument.objects.for_sale(sale).select_related("sale")
    }
    rows = []
    for kind in document_kinds_for(sale):
        document = signed.get(kind)
        rows.append(
            {
                "kind": kind,
                "label": LABELS[kind],
                "signed": bool(document),
                "signed_at": document.signed_at if document else None,
                "signed_by_role": document.signed_by_role if document else "",
                "signer_name": document.signer_name if document else "",
                "is_stale": document.is_stale if document else False,
                "template_version": document.template_version if document else "",
            }
        )
    return rows
