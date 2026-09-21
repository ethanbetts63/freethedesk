"""Load the prescribed forms held in the repository as ``FormTemplate`` rows.

The forms are records rather than files in the repository *at runtime* — staff
swap them when the Department publishes a new one — but a fresh environment has
to start somewhere, and the copies in `_docs/licensing/wa_dealer_forms/` are the
ones the field maps were written against.

Idempotent: a version already loaded is left alone rather than re-uploaded, so
running this on an environment where staff have since replaced a file does not
undo them.
"""

from pathlib import Path

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from documents.field_maps import MR9B_VERSION, VL17_VERSION
from documents.models import FormTemplate

SOURCE_DIR = Path(settings.BASE_DIR) / "_docs" / "licensing" / "wa_dealer_forms"

#: kind -> (filename, version label, note)
#:
#: VL17 and MR9B carry the revision dates printed on the forms themselves, and
#: those labels are what `documents/field_maps.py` is keyed by — changing one
#: without adding a map there makes generation refuse, which is the intent.
#:
#: Form 5A and Form 6 print no revision marking, so their label is the date the
#: copy on hand was obtained. They are served rather than filled, so no field
#: map depends on it.
FORMS = {
    FormTemplate.Kind.VL17: (
        "dot-VL17-application-to-licence-a-vehicle.pdf",
        VL17_VERSION,
        "Revision date printed on the form.",
    ),
    FormTemplate.Kind.MR9B: (
        "dot-MR9B-vehicle-transfer-dealers-only.pdf",
        MR9B_VERSION,
        "Revision date printed on the form. Two-part carbon form.",
    ),
    FormTemplate.Kind.FORM_5A_MOTORCYCLE: (
        "form-5a-statutory-warranty-motorcycle.pdf",
        "2026-08-21",
        "No revision marking on the form; label is the date this copy was obtained.",
    ),
    FormTemplate.Kind.FORM_6: (
        "form-6-no-statutory-warranty.pdf",
        "2026-08-21",
        "No revision marking on the form; label is the date this copy was obtained.",
    ),
}


class Command(BaseCommand):
    help = "Load the prescribed WA forms from _docs/licensing/wa_dealer_forms/."

    def add_arguments(self, parser):
        parser.add_argument(
            "--replace",
            action="store_true",
            help="Re-upload the file for a version that already exists.",
        )

    def handle(self, *args, **options):
        loaded, skipped = 0, 0
        for kind, (filename, version_label, note) in FORMS.items():
            source = SOURCE_DIR / filename
            if not source.exists():
                self.stderr.write(f"Missing: {source}")
                continue

            template, created = FormTemplate.objects.get_or_create(
                kind=kind,
                version_label=version_label,
                defaults={"notes": note},
            )
            if created or options["replace"] or not template.file:
                template.file.save(filename, ContentFile(source.read_bytes()), save=True)
                loaded += 1
            else:
                skipped += 1
            template.make_current()
            self.stdout.write(f"{kind} {version_label} — current")

        self.stdout.write(self.style.SUCCESS(f"{loaded} loaded, {skipped} already present."))
