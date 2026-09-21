"""The prescribed terms, checked against the regulations themselves.

This is the golden test `_docs/licensing/plan/07-build-sequence.md` asks for, and
it is deliberately not a stored hash of our own file. A hash proves the text has
not changed since somebody last looked at it; reading every clause back out of
the legislation proves it was right when they did. A reword is then caught
rather than reviewed.

The source is the consolidation in `_docs/licensing/wa_dealer_forms/`. If the
regulations are amended, this fails, and the fix is to re-extract
`schedule5_terms.py` from the new consolidation and update its citation — not to
edit this test.
"""

import html
import re
from pathlib import Path

import pytest
from django.conf import settings

from documents.schedule5_terms import CITATION, PRESCRIBED_TERMS

REGULATIONS = (
    Path(settings.BASE_DIR)
    / "_docs"
    / "licensing"
    / "wa_dealer_forms"
    / "mv-dealers-sales-regulations-1974-CURRENT-03-j0-00-as-at-2024-06-07.html"
)


def normalise(text: str) -> str:
    """Collapse the differences that are typography rather than wording.

    Two of them, both artefacts of the published HTML rather than of the text:
    it uses a non-breaking hyphen (U+2011) in "Trade-In" and "pre-estimated",
    and it wraps lines mid-phrase so whitespace runs are arbitrary. Nothing else
    is normalised — case, punctuation and the curly apostrophes all have to
    match, because a prescribed term is prescribed down to its characters.
    """
    text = text.replace("‑", "-")
    text = re.sub(r"\s*-\s*", "-", text)
    return re.sub(r"\s+", " ", text).strip()


@pytest.fixture(scope="module")
def regulations_text():
    raw = REGULATIONS.read_text(encoding="utf-8", errors="replace")
    return normalise(html.unescape(re.sub(r"<[^>]+>", " ", raw)))


def all_clauses():
    for part_number, part_heading, clauses in PRESCRIBED_TERMS:
        for number, body, subs in clauses:
            yield number, body
            for label, sub in subs:
                yield f"{number}({label})", sub


CLAUSES = list(all_clauses())


def test_the_source_document_is_present():
    """Without it the parametrised tests below would silently collect nothing."""
    assert REGULATIONS.exists()
    assert len(CLAUSES) == 32


@pytest.mark.parametrize("number,text", CLAUSES, ids=[number for number, _ in CLAUSES])
def test_each_clause_appears_verbatim_in_the_regulations(number, text, regulations_text):
    assert normalise(text) in regulations_text, (
        f"Clause {number} does not appear verbatim in {REGULATIONS.name}. "
        "A prescribed term must not be reworded, renumbered or tidied."
    )


def test_the_parts_are_numbered_and_headed_as_the_schedule_has_them():
    headings = [(number, heading) for number, heading, _clauses in PRESCRIBED_TERMS]

    assert headings == [
        (1, "FORMATION"),
        (2, "FINANCE"),
        (3, "THE PURCHASE PRICE"),
        (4, "DELIVERY OF THE VEHICLE"),
        (5, "PASSING OF PROPERTY AND RISK IN THE VEHICLE"),
        (6, "TRADE-IN VEHICLE"),
        (7, "PURCHASER’S RIGHT TO TERMINATE THIS CONTRACT"),
        (8, "DEALER’S RIGHT TO TERMINATE THIS CONTRACT"),
        (9, "NOTICES"),
    ]


def test_the_citation_names_the_consolidation_the_text_came_from():
    """The file the test reads and the citation the contract prints have to be
    the same document, or the contract cites a version nobody checked."""
    assert "03-j0-00" in CITATION
    assert "7 Jun 2024" in CITATION
    assert "03-j0-00" in REGULATIONS.name


def test_the_three_clauses_the_flow_is_built_around_are_present():
    """cl 1.1, 1.2 and 1.3 are the offer, the acceptance with notice, and the
    lapse. The whole signing and acceptance design rests on them, so a change to
    any of them is a change to the product and not only to a document."""
    clauses = dict(CLAUSES)

    assert "an offer has been made to purchase the Vehicle" in clauses["1.1"]
    assert "notice of the acceptance is given to the Purchaser" in clauses["1.2(b)"]
    assert "automatically lapse at the close of business" in clauses["1.3"]
