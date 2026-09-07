from pathlib import Path
from uuid import uuid4


def dealer_document_path(instance, filename: str) -> str:
    """Keep original filenames and dealer details out of stored object keys.

    Defined here (not in ``dealer_profile.py``) so its dotted import path stays
    ``dealers.models.dealer_document_path`` — that's the path already frozen into
    existing migrations as a ``FileField(upload_to=...)`` callable, and moving the
    function would make ``makemigrations`` think the field changed.
    """
    suffix = Path(filename).suffix.lower()
    return f"dealer-documents/{instance.dealer_id}/{uuid4().hex}{suffix}"


from .dealer import Dealer  # noqa: E402
from .dealer_profile import DealerProfile  # noqa: E402

__all__ = ["Dealer", "DealerProfile", "dealer_document_path"]
