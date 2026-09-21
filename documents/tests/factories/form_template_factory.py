from pathlib import Path

import factory
from django.conf import settings
from django.core.files.base import ContentFile

from documents.field_maps import MR9B_VERSION, VL17_VERSION
from documents.models import FormTemplate

SOURCE_DIR = Path(settings.BASE_DIR) / "_docs" / "licensing" / "wa_dealer_forms"

#: The real published PDFs, because filling one is the thing under test and a
#: stub with no AcroForm in it would pass while proving nothing.
FILES = {
    FormTemplate.Kind.VL17: ("dot-VL17-application-to-licence-a-vehicle.pdf", VL17_VERSION),
    FormTemplate.Kind.MR9B: ("dot-MR9B-vehicle-transfer-dealers-only.pdf", MR9B_VERSION),
    FormTemplate.Kind.FORM_5A_MOTORCYCLE: (
        "form-5a-statutory-warranty-motorcycle.pdf",
        "2026-08-21",
    ),
    FormTemplate.Kind.FORM_6: ("form-6-no-statutory-warranty.pdf", "2026-08-21"),
}


class FormTemplateFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = FormTemplate

    kind = FormTemplate.Kind.VL17
    version_label = VL17_VERSION
    is_current = True

    @factory.post_generation
    def file(self, create, extracted, **kwargs):
        if not create:
            return
        filename, _version = FILES[self.kind]
        self.file.save(filename, ContentFile((SOURCE_DIR / filename).read_bytes()), save=True)


def load_current_templates():
    """Every prescribed form, at the version its field map is written for."""
    return {
        kind: FormTemplateFactory(kind=kind, version_label=version)
        for kind, (_filename, version) in FILES.items()
    }
