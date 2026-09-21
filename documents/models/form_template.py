"""The prescribed forms, as records rather than as files in the repository.

The Department reissues these — every one of them between July and August 2025,
and the two on hand carry 2026 revision dates — and a reissue that renames a
field breaks every dealer at once, silently, producing a blank box rather than
an error.

So the split: **the PDF is a row** that staff can swap when a new one is
published, and **the field map stays in code**, keyed by ``(kind,
version_label)``. A renamed field needs a developer however it arrives, and
putting the map in the database would mean somebody editing field names in a
form to fix a document that is quietly wrong.

``is_current`` is a column rather than "the newest row" because which version is
in force is a decision, not an ordering. A form downloaded today may not be the
one to use tomorrow, and a reissue is sometimes held back.
"""

from pathlib import Path
from uuid import uuid4

from django.db import models, transaction

from .storage import private_template_storage


def form_template_path(instance, filename: str) -> str:
    """``vl17/<uuid>.pdf``, relative to the template storage's own tree.

    No ``form-templates/`` prefix: ``PrivateTemplateStorage`` already puts its
    base location there, and naming it again produced
    ``form-templates/form-templates/vl17/…`` on disk.
    """
    suffix = Path(filename).suffix.lower() or ".pdf"
    return f"{instance.kind}/{uuid4().hex}{suffix}"


class FormTemplate(models.Model):
    """One published version of one prescribed form."""

    class Kind(models.TextChoices):
        VL17 = "vl17", "VL17 — Application to licence a vehicle"
        MR9B = "mr9b", "MR9B — Notification of change of owner"
        FORM_5A_MOTORCYCLE = "form_5a_motorcycle", "Form 5A — Statutory warranty (motorcycle)"
        FORM_6 = "form_6", "Form 6 — No statutory warranty"

    kind = models.CharField(max_length=32, choices=Kind.choices, db_index=True)
    #: The Department's own revision marking where the form prints one, and the
    #: date the copy was obtained where it does not.
    version_label = models.CharField(max_length=32)
    effective_from = models.DateField(null=True, blank=True)
    file = models.FileField(storage=private_template_storage, upload_to=form_template_path)
    is_current = models.BooleanField(default=False, db_index=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["kind", "-effective_from", "-id"]
        constraints = [
            models.UniqueConstraint(
                fields=["kind", "version_label"], name="form_template_kind_version_unique"
            ),
        ]

    def __str__(self) -> str:
        return f"{self.get_kind_display()} ({self.version_label})"

    def make_current(self):
        """Put this version in force, and take the previous one out of it.

        One current version per kind, enforced here rather than by a partial
        unique constraint: MySQL does not support a unique constraint with a
        condition, so Django would accept the declaration, skip creating it, and
        leave a rule that reads as enforced and is not. A transaction and two
        statements is less clever and actually runs.
        """
        with transaction.atomic():
            type(self).objects.filter(kind=self.kind, is_current=True).exclude(
                pk=self.pk
            ).update(is_current=False)
            self.is_current = True
            self.save(update_fields=["is_current", "updated_at"])
        return self

    @classmethod
    def current(cls, kind):
        """The version in force for ``kind``, or ``None``.

        Returning ``None`` rather than raising: the caller decides what a
        missing template means, and it means different things for a form that is
        filled and one that is merely served.
        """
        return cls.objects.filter(kind=kind, is_current=True).first()
