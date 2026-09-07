"""Content-based validation for dealer identity and business documents."""

import warnings

from PIL import Image as PillowImage
from pypdf import PdfReader


ALLOWED_UPLOADS = {
    "application/pdf": ("pdf", (b"%PDF",)),
    "image/jpeg": ("jpg", (b"\xff\xd8\xff",)),
    "image/png": ("png", (b"\x89PNG\r\n\x1a\n",)),
    "image/webp": ("webp", (b"RIFF",)),
}
MAX_DOCUMENT_BYTES = 10 * 1024 * 1024
MAX_IMAGE_PIXELS = 25_000_000
MAX_PDF_PAGES = 50


def sniff_upload(upload):
    upload.seek(0)
    head = upload.read(32)
    upload.seek(0)
    if head.startswith(b"RIFF") and head[8:12] == b"WEBP":
        return "image/webp"
    for content_type, (_extension, prefixes) in ALLOWED_UPLOADS.items():
        if content_type != "image/webp" and any(head.startswith(prefix) for prefix in prefixes):
            return content_type
    return None


def has_safe_upload_content(upload, content_type):
    try:
        upload.seek(0)
        if content_type == "application/pdf":
            reader = PdfReader(upload, strict=True)
            if reader.is_encrypted or len(reader.pages) > MAX_PDF_PAGES:
                return False
        elif content_type.startswith("image/"):
            with warnings.catch_warnings():
                warnings.simplefilter("error", PillowImage.DecompressionBombWarning)
                image = PillowImage.open(upload)
                image.verify()
                upload.seek(0)
                image = PillowImage.open(upload)
                if image.width * image.height > MAX_IMAGE_PIXELS:
                    return False
                image.load()
        else:
            return False
    except Exception:
        return False
    finally:
        upload.seek(0)
    return True


def validate_and_rename_upload(upload):
    if upload.size > MAX_DOCUMENT_BYTES:
        return None, "Files must be no larger than 10 MB."
    content_type = sniff_upload(upload)
    if not content_type or not has_safe_upload_content(upload, content_type):
        return None, "Upload a valid PDF, JPG, PNG or WebP file."
    upload.name = f"upload.{ALLOWED_UPLOADS[content_type][0]}"
    return upload, None
