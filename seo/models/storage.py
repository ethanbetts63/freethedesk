"""A private tree of its own for the prospect reports waiting to be emailed.

Under ``PRIVATE_MEDIA_ROOT`` like the dealer documents and identity images, in a
subdirectory of its own: each report's page and its link's preview picture,
served only through the report's link. No webserver is pointed at this tree.
"""

import os

from django.conf import settings
from django.core.files.storage import FileSystemStorage


class PrivateProspectReportStorage(FileSystemStorage):
    @property
    def base_location(self):
        return os.path.join(settings.PRIVATE_MEDIA_ROOT, "seo-prospects")

    @property
    def location(self):
        return os.path.abspath(self.base_location)

    def url(self, name):
        # Django's admin file widget needs a URL; this storage is deliberately
        # not web-addressable.
        return "#"


def private_prospect_report_storage():
    return PrivateProspectReportStorage()
