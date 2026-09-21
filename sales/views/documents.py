"""Downloading a sale's documents, from the dealer's side.

Two things are served here and they are different in kind. A *document* this
product produces — the contract, the licensing form, the Authority to Lodge — is
built on demand from the sale, or streamed from the private tree once it has
been signed. A *warranty notice* is a prescribed form served exactly as the
Department publishes it: reg 7 requires the purchaser be given an information
statement *in the form of* Form 5A or Form 6, so the form is the statement and
nothing fills it in.
"""

from rest_framework.response import Response
from rest_framework.views import APIView

from documents.build import build_unsigned, document_kinds_for
from documents.field_maps import MissingFieldMap
from documents.models import SaleDocument
from documents.render.contract import SaleContractError
from documents.render.prescribed import TemplateUnavailable
from documents.responses import pdf_response, stored_file_response
from documents.warranty import WarrantyNoticeUnavailable, notice_template
from .dealer import DealerSaleQuerysetMixin


class DealerSaleDocumentView(DealerSaleQuerysetMixin, APIView):
    """One document, unsigned by default or the stored signed copy on request.

    Scoped as ``document-render`` rather than ``portal`` because typesetting a
    Schedule 5 contract is real CPU, and the same work is reachable from the
    customer's side of the product by somebody holding no account. Naming the
    scope for the cost rather than for the caller is what section 5 of the
    security standard asks for.
    """

    throttle_scope = "document-render"

    def get(self, request, reference, kind):
        sale = self.dealer_sales().filter(reference=reference).first()
        if sale is None:
            return Response({"detail": "Not found."}, status=404)
        if kind not in document_kinds_for(sale):
            return Response({"detail": "This sale does not produce that document."}, status=404)

        if request.query_params.get("version") == "signed":
            document = SaleDocument.objects.for_sale(sale).filter(kind=kind).first()
            if document is None or not document.file:
                return Response({"detail": "This document has not been signed yet."}, status=404)
            return stored_file_response(document.file, f"{kind}-{sale.reference}.pdf")

        return build_or_explain(sale, kind)


def build_or_explain(sale, kind):
    """Build an unsigned document, turning each refusal into a sentence.

    The three refusals are different problems for different people, so they are
    kept apart rather than collapsed into one 500:

    - **No price.** A form quoting no price is not worth reading, and this is
      the dealer's to fix. A 409 with a sentence, not a failure.
    - **Not enough to identify the parties.** Only the contract raises this —
      the prescribed forms stay fillable and print a blank box instead, because
      blocking the download only ever moves the problem to a counter.
    - **A form version nobody has written a field map for.** This one is ours.
      It answers 503 alongside a missing template, because they are the same
      failure told two ways — our paperwork plumbing is not ready — and neither
      is anything the caller did.
    """
    if sale.vehicle_price is None:
        return Response(
            {"detail": "Set a price on this sale before producing its paperwork."},
            status=409,
        )
    try:
        built = build_unsigned(sale, kind)
    except SaleContractError as error:
        return Response({"detail": str(error)}, status=409)
    except TemplateUnavailable as error:
        return Response({"detail": str(error)}, status=503)
    except MissingFieldMap as error:
        # Not a 400 and not a 409. Nobody in the request can fix this: the
        # Department has reissued a form and no map has been written for the new
        # version. A 4xx would have a dealer re-typing a sale that is already
        # fine; 503 says the truth, which is that this is ours and temporary.
        return Response({"detail": str(error)}, status=503)
    return pdf_response(built.filename, built.content)


class DealerSaleWarrantyNoticeView(DealerSaleQuerysetMixin, APIView):
    """The Form 5A or Form 6 this sale's warranty test selects.

    New stock has neither: the manufacturer's warranty information is product
    copy rather than a prescribed form, and the sale's own warranty block
    carries it.
    """

    throttle_scope = "document-render"

    def get(self, request, reference):
        sale = self.dealer_sales().filter(reference=reference).first()
        if sale is None:
            return Response({"detail": "Not found."}, status=404)
        return warranty_notice_or_explain(sale)


def warranty_notice_or_explain(sale):
    if not sale.is_used_stock:
        return Response(
            {"detail": "New stock has no prescribed warranty form. See the warranty block."},
            status=404,
        )
    try:
        template = notice_template(sale)
    except WarrantyNoticeUnavailable as error:
        return Response({"detail": str(error)}, status=503)
    return stored_file_response(template.file, f"{template.kind}-{template.version_label}.pdf")
