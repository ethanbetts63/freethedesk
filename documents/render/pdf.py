"""Shared typesetting: the styles, the labelled table, and the page furniture.

Two documents are typeset rather than filled — the Schedule 5 contract and the
Authority to Lodge — and they are different instruments with the same publisher.
Keeping their styles here stops them drifting into two house styles, and keeps
anything that knows about a sale out of the layer that only knows about paper.
"""

import io

from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas as pdfcanvas
from reportlab.platypus import Paragraph, SimpleDocTemplate, Table, TableStyle

BODY = ParagraphStyle(
    "body", fontName="Helvetica", fontSize=8.5, leading=11.5, alignment=TA_JUSTIFY
)
PART_HEADING = ParagraphStyle(
    "part", fontName="Helvetica-Bold", fontSize=9, leading=12, spaceBefore=7, spaceAfter=3
)
SECTION = ParagraphStyle(
    "section", fontName="Helvetica-Bold", fontSize=11, leading=14, spaceBefore=12, spaceAfter=6
)
TITLE = ParagraphStyle("title", fontName="Helvetica-Bold", fontSize=15, leading=18, spaceAfter=2)
NOTE = ParagraphStyle(
    "note", fontName="Helvetica-Oblique", fontSize=7.5, leading=10,
    textColor=colors.HexColor("#57534e"), spaceAfter=6,
)
LABEL = ParagraphStyle("label", fontName="Helvetica-Bold", fontSize=8, leading=11)
VALUE = ParagraphStyle("value", fontName="Helvetica", fontSize=8, leading=11)
GROUP_HEADING = ParagraphStyle(
    "group", fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=colors.white
)
CLAUSE = ParagraphStyle("clause", parent=BODY, leftIndent=22, spaceAfter=4)
SUBCLAUSE = ParagraphStyle("sub", parent=BODY, leftIndent=40, spaceAfter=3)

PAGE_WIDTH = 165 * mm


def rows_table(rows, heading, *, label_width=45 * mm, value_width=120 * mm):
    """One labelled block of a document's own fields, under a heading.

    Grouped so a reader checking their own name is not scanning past a dealer
    licence number to find it. A blank value is a field somebody fills in by
    hand.
    """
    data = [[Paragraph(heading, GROUP_HEADING), ""]]
    data += [[Paragraph(label, LABEL), Paragraph(str(value), VALUE)] for label, value in rows]
    table = Table(data, colWidths=[label_width, value_width])
    table.setStyle(
        TableStyle(
            [
                ("SPAN", (0, 0), (1, 0)),
                ("BACKGROUND", (0, 0), (1, 0), colors.HexColor("#1c1917")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 2.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#d6d3d1")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f5f5f4")]),
            ]
        )
    )
    return table


class NumberedCanvas(pdfcanvas.Canvas):
    """Stamps a running header and "Page X of Y" on every page.

    Two passes, because the total is not known until the document is finished:
    pages are held as state during the build and written out at save time.

    Worth the machinery. A contract that gets separated, printed one-sided or
    scanned out of order has to be reassemblable, and a page with no number and
    no title is a loose sheet nobody can place.
    """

    def __init__(self, *args, header="", reference="", **kwargs):
        super().__init__(*args, **kwargs)
        self._header = header
        self._reference = reference
        self._pages = []

    def showPage(self):
        self._pages.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        total = len(self._pages)
        for state in self._pages:
            self.__dict__.update(state)
            self._draw_furniture(total)
            super().showPage()
        super().save()

    def _draw_furniture(self, total):
        width, height = self._pagesize
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(colors.HexColor("#57534e"))
        self.drawString(18 * mm, height - 9 * mm, self._header)
        self.drawRightString(width - 18 * mm, height - 9 * mm, self._reference)
        self.setStrokeColor(colors.HexColor("#d6d3d1"))
        self.setLineWidth(0.4)
        self.line(18 * mm, height - 11 * mm, width - 18 * mm, height - 11 * mm)

        self.setFont("Helvetica", 7.5)
        self.drawCentredString(width / 2, 9 * mm, f"Page {self._pageNumber} of {total}")


def build_document(story, *, title, author, header, reference) -> bytes:
    """Lay out a story on A4 with the running furniture, and return the bytes.

    Nothing is written to disk. A completed document carries a name, an address
    and a price, so it is built on demand and streamed — only a *signed* one
    persists, and that is stored by the signing step rather than here.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=16 * mm,
        title=title,
        author=author,
    )
    doc.build(
        story,
        canvasmaker=lambda *args, **kwargs: NumberedCanvas(
            *args, header=header, reference=reference, **kwargs
        ),
    )
    return buffer.getvalue()
