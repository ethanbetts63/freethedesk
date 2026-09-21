"""Private trees for documents no webserver is pointed at.

Same shape as ``dealers.utils.storage``, and deliberately separate classes
rather than one shared instance: a signed contract carrying a licence number
and a blank prescribed form the Department publishes on its own website are not
the same category of file, and giving them one storage class would make that
distinction invisible the first time somebody wanted to serve one of them.

Both sit under ``PRIVATE_MEDIA_ROOT``, outside ``MEDIA_ROOT``, which is what
makes the authenticated view the entire access-control story for them.
"""

import os

from django.conf import settings
from django.core.files.storage import FileSystemStorage


class PrivateDocumentStorage(FileSystemStorage):
    """Signed sale documents. Reachable only through an authenticated view."""

    subdirectory = "sale-documents"

    @property
    def base_location(self):
        return os.path.join(settings.PRIVATE_MEDIA_ROOT, self.subdirectory)

    @property
    def location(self):
        return os.path.abspath(self.base_location)

    def url(self, name):
        # Django's admin file widget needs a URL; this storage is deliberately
        # not web-addressable.
        return "#"


class PrivateTemplateStorage(PrivateDocumentStorage):
    """Blank prescribed forms, uploaded by staff."""

    subdirectory = "form-templates"


def private_document_storage():
    return PrivateDocumentStorage()


def private_template_storage():
    return PrivateTemplateStorage()
