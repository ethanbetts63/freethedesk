"""Every writable string field the API accepts has a ceiling.

A serializer field with no ``max_length`` does not fail, complain, or look any
different from one that has been thought about. It simply accepts whatever
arrives -- a ten-megabyte name, a body that takes the database with it -- and
DRF's defaults make that the easy mistake to make: ``serializers.CharField()``
is unbounded, ``EmailField`` and ``URLField`` are unbounded, and a model
``TextField`` reaches a ``ModelSerializer`` as an unbounded ``CharField``.

The fields were audited once and driven to zero. This is what keeps them there,
because the next one added will look exactly like the ones that are already
right.

Bounds come from ``freetheplatform.security.bounds``, one table of field kinds
shared with the frontend. See ../freetheplatform/_docs/security-standard.md,
section 9.
"""

import importlib
import pkgutil

import pytest
from django.apps import apps
from django.conf import settings
from rest_framework import serializers

# Serializers whose string fields are deliberately unbounded, each with the
# reason. Anything not listed here must carry a ceiling.
#
# Keep this list short and argued. "It was easier" is not a reason; if a field
# genuinely has no natural ceiling it still has a practical one, and
# `bounds.FIELD_MAX["long_text"]` is almost always it.
EXEMPT: dict[str, str] = {}


def _ours(path):
    """Is this file part of this repository, rather than something installed?

    The virtualenv lives inside the project directory, so "under BASE_DIR" is
    not enough on its own -- it would drag in DRF's and simplejwt's own
    serializers, which are not ours to bound.
    """
    if not path:
        return False
    return str(path).startswith(str(settings.BASE_DIR)) and "site-packages" not in str(path)


def _local_app_modules():
    """Every module under an app that lives in this repository.

    Third-party apps are excluded: their serializers are not ours to bound, and
    DRF's own test fixtures would fail this on purpose.
    """
    for config in apps.get_app_configs():
        if not _ours(str(config.path)):
            continue
        yield config.module.__name__
        for info in pkgutil.walk_packages(config.module.__path__, f"{config.module.__name__}."):
            yield info.name


def _import_everything():
    """Import the project so that every serializer class actually exists.

    ``__subclasses__`` only knows about classes that have been imported, so a
    serializer in a module nothing has touched yet would be invisible -- which
    is precisely the serializer most likely to have been missed.
    """
    for name in _local_app_modules():
        if ".migrations." in name or name.endswith(".migrations"):
            continue
        if ".tests" in name or name.endswith("tests"):
            continue
        try:
            importlib.import_module(name)
        except Exception:  # pragma: no cover - an unimportable module is its own test's problem
            continue


def _descendants(cls):
    for subclass in cls.__subclasses__():
        yield subclass
        yield from _descendants(subclass)


def _project_serializers():
    _import_everything()
    seen = {}
    for cls in _descendants(serializers.BaseSerializer):
        module = importlib.import_module(cls.__module__) if cls.__module__ else None
        if not _ours(getattr(module, "__file__", None)):
            continue
        if ".tests." in cls.__module__ or cls.__module__.endswith("tests"):
            continue
        seen[f"{cls.__module__}.{cls.__qualname__}"] = cls
    return seen


def _unbounded(field):
    """Report a writable string field with no ceiling.

    ``EmailField``, ``URLField``, ``SlugField`` and ``RegexField`` all subclass
    ``CharField``, so one check covers them. A ``ChoiceField`` is bounded by its
    choices and a ``JSONField`` is not a string, so neither appears here.
    """
    if field.read_only:
        return False
    if isinstance(field, serializers.ListField):
        return _unbounded(field.child)
    if not isinstance(field, serializers.CharField):
        return False
    return field.max_length is None


def _fields(cls):
    """The declared fields, or nothing if the class cannot stand on its own.

    A serializer that needs constructor arguments is exercised by the tests of
    whatever builds it; this one walks the API surface, and a class that cannot
    be instantiated bare is not directly part of it.
    """
    try:
        return cls().fields.items()
    except Exception:
        return []


@pytest.mark.django_db
def test_no_writable_string_field_is_unbounded():
    offenders = []
    for name, cls in sorted(_project_serializers().items()):
        if name in EXEMPT:
            continue
        for field_name, field in _fields(cls):
            if _unbounded(field):
                offenders.append(f"{name}.{field_name} ({type(field).__name__})")

    assert not offenders, (
        "These writable string fields accept input of any length:\n  "
        + "\n  ".join(offenders)
        + "\n\nGive each one a ceiling from freetheplatform.security.bounds -- "
        "bounds.char('name'), bounds.email(), bounds.text() and so on -- or, if "
        "it is genuinely meant to be unbounded, add it to EXEMPT in this file "
        "with the reason."
    )


def test_the_walker_actually_finds_serializers():
    """A guard on the guard.

    Every check above is a loop over a collection, and a loop over an empty
    collection passes. If an import path changes and the walker stops finding
    anything, this is what says so rather than a green test that checks nothing.
    """
    found = _project_serializers()
    assert len(found) > 20, f"only found {len(found)} serializers: {sorted(found)}"
