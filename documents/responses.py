"""Streaming a document out.

One streaming helper, two authorisations. The customer reaches their own
documents through the sale access cookie and the dealer through their session
and tenant scope, and those two checks stay at their own call sites: the
mechanical part is shared, and the part that decides who may read a driver's
licence stays visible where it is decided.
"""

from django.http import FileResponse, HttpResponse


def pdf_response(filename: str, content: bytes) -> HttpResponse:
    """A freshly built document, as a download.

    ``attachment`` rather than ``inline`` because these are documents somebody
    is meant to keep, and because a PDF rendered in a browser tab is a URL that
    ends up in history with a licence number behind it.
    """
    response = HttpResponse(content, content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    response["X-Content-Type-Options"] = "nosniff"
    return response


def stored_file_response(stored_file, filename: str) -> FileResponse:
    """A file from the private tree.

    The type is asserted rather than sniffed: everything stored here is produced
    by this application and is a PDF. ``nosniff`` stops a browser second-guessing
    that.
    """
    response = FileResponse(stored_file.open("rb"), content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    response["X-Content-Type-Options"] = "nosniff"
    return response
