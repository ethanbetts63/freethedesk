"""Filling VL17 and MR9B.

Both are fillable AcroForms, so this is writing values into named fields on the
published PDF rather than typesetting anything.

**Never refuses on a missing detail.** Both forms stay fillable, so a value the
sale does not hold yet prints as a blank box somebody can write in rather than
as a document nobody can produce. Blocking the download only ever moves the
problem to a counter. The one gate is price, and that is the caller's to apply —
a form quoting no price is not worth reading, but it is still a form.

It does refuse on two things, both of which are about the form rather than the
sale: no current template uploaded, and no field map for the version that is.
"""

import io

from pypdf import PdfReader, PdfWriter

from documents.field_maps import values_for
from documents.models import FormTemplate


class TemplateUnavailable(RuntimeError):
    """The prescribed form this sale needs has no current version loaded."""


def form_kind_for(sale) -> str:
    """MR9B transfers a licence that exists; VL17 grants one that does not."""
    return FormTemplate.Kind.MR9B if sale.is_used_stock else FormTemplate.Kind.VL17


def fill(template: FormTemplate, values: dict) -> bytes:
    """Write ``values`` into every page's form fields and return the PDF bytes.

    ``set_need_appearances_writer`` asks the reader to draw the field contents
    itself rather than relying on appearance streams the template may not carry
    for every field. Without it a filled form opens blank in some readers, which
    is the worst of both outcomes: correct data, invisible.
    """
    with template.file.open("rb") as handle:
        reader = PdfReader(io.BytesIO(handle.read()))

    writer = PdfWriter()
    writer.append(reader)
    writer.set_need_appearances_writer(True)
    for page in writer.pages:
        writer.update_page_form_field_values(page, values)

    output = io.BytesIO()
    writer.write(output)
    return output.getvalue()


def build_licensing_form(sale, dealer, profile):
    """Return ``(filename, template, pdf_bytes)`` for this sale's licensing form."""
    kind = form_kind_for(sale)
    template = FormTemplate.current(kind)
    if template is None:
        raise TemplateUnavailable(
            f"No current {kind} template is loaded, so this sale's licensing form "
            "cannot be produced."
        )
    values = values_for(kind, template.version_label, sale, dealer, profile)
    filename = f"{kind}-{sale.reference}.pdf"
    return filename, template, fill(template, values)
