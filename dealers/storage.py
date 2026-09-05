"""Storage for identifying dealer documents that must never be public media."""

import os

from django.conf import settings
from django.core.files.storage import FileSystemStorage


class PrivateDealerDocumentStorage(FileSystemStorage):
    @property
    def base_location(self):
        return settings.PRIVATE_MEDIA_ROOT

    @property
    def location(self):
        return os.path.abspath(self.base_location)

    def url(self, name):
        # Django's admin file widget expects a URL even when the storage is
        # deliberately not web-addressable. A fragment keeps the form usable
        # without exposing a filesystem path or creating a public media route.
        return "#"


def private_document_storage():
    return PrivateDealerDocumentStorage()
