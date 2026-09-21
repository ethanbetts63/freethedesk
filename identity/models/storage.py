"""A private tree of its own for customer identity images.

Under ``PRIVATE_MEDIA_ROOT`` like the dealer documents, and a separate
subdirectory rather than a shared one: everything in this tree is one category
under one retention rule, so a future answer about these images — an erasure
request, a change of provider — is a question about one directory rather than
a query picking rows out of a shared one.

No webserver is pointed at this tree, which makes the authenticated view the
entire access-control story for what is in it.
"""

import os

from django.conf import settings
from django.core.files.storage import FileSystemStorage


class PrivateIdentityStorage(FileSystemStorage):
    @property
    def base_location(self):
        return os.path.join(settings.PRIVATE_MEDIA_ROOT, "identity")

    @property
    def location(self):
        return os.path.abspath(self.base_location)

    def url(self, name):
        # Django's admin file widget needs a URL; this storage is deliberately
        # not web-addressable.
        return "#"


def private_identity_storage():
    return PrivateIdentityStorage()
