"""The Authority to Lodge.

New, and the price of selling the plans separately. A licensing-only dealer has
no Schedule 5 contract, so SC2 — the clause appointing the dealer to lodge with
the Department of Transport — has nowhere to live. This short standalone
instrument carries it instead.

**Draft wording, not reviewed by a WA lawyer.** Like every other clause in this
product it is a published `freetheplatform.agreements` version, so the reviewed
wording lands as a version bump rather than as a change to anything built around
it. Nothing waits on it.

The point to get right is the last clause: a licensing-only dealer is using this
product *alongside* whatever contract they use themselves, and an instrument
that read like a sale agreement would collide with it. It says so in terms.
"""

from reportlab.platypus import Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.units import mm

from .pdf import BODY, CLAUSE, LABEL, NOTE, PART_HEADING, SECTION, TITLE, VALUE, build_document, rows_table

#: Bumped when the wording below changes, and published under this version so a
#: customer's signature names the exact text they signed.
VERSION = "2026-09-19"

AGREEMENT_KEY = "customer.authority_to_lodge"
AGREEMENT_TITLE = "Authority to Lodge a Vehicle Licence Application"


def _address(*parts):
    return ", ".join(part for part in parts if part)


def _vehicle_rows(sale):
    described = " ".join(
        part for part in (str(sale.year or ""), sale.make, sale.model_name) if part
    )
    return [
        ("Vehicle", described),
        ("VIN", sale.vin or "To be advised"),
        ("Engine number", sale.engine_number or "To be advised"),
        ("Registration", sale.registration or "Not yet licensed"),
        ("Sale reference", sale.reference),
    ]


def _party_rows(sale, dealer, profile):
    licence_holder = " ".join(
        part for part in (sale.licence_given_names, sale.licence_family_name) if part
    )
    purchaser = (
        licence_holder
        if sale.purchaser_is_licence_holder
        else " ".join(
            part for part in (sale.purchaser_given_names, sale.purchaser_family_name) if part
        )
    )
    return [
        ("Purchaser", purchaser or sale.customer_name),
        ("Proposed licence holder", licence_holder),
        ("Driver’s licence no.", sale.licence_number),
        (
            "Licence holder address",
            _address(sale.licensee_address_line1, sale.licensee_suburb, sale.licensee_postcode),
        ),
        ("Dealer", profile.legal_name or dealer.business_name),
        ("Dealer licence number", profile.dealer_licence_number),
        ("Dealer email", dealer.user.email),
    ]


def clauses(sale):
    """The operative wording, as ``(heading, [paragraph, ...])``.

    Returned as data rather than written straight into the layout so the same
    text can be published as the agreement version a customer's signature points
    at. Two copies of an instrument's wording is one copy that can be edited
    without the other.
    """
    same_person = sale.purchaser_is_licence_holder
    licence_holder = (
        " ".join(part for part in (sale.licence_given_names, sale.licence_family_name) if part)
        or "the proposed licence holder"
    )

    blocks = [
        (
            "1. Appointment",
            [
                "The Purchaser appoints the Dealer as their authorised representative "
                "for the purpose of lodging the application to licence the Vehicle "
                "described above with the Department of Transport, and authorises the "
                "Dealer to lodge that application and any supporting documents on the "
                "Purchaser’s behalf.",
                "This authority is limited to the Vehicle and the proposed licence "
                "holder identified above. It is not a general authority to act for the "
                "Purchaser in any other matter.",
            ],
        )
    ]

    if not same_person:
        # Mirrors SC2's fork. A vehicle bought by one person and licensed to
        # another is an ordinary sale, and the instrument has to name the person
        # whose licence it is.
        blocks.append(
            (
                "2. Licensing in another person’s name",
                [
                    "The Vehicle is to be licensed in the name of "
                    f"{licence_holder} (the Proposed Licence Holder).",
                    "The Purchaser confirms that the Proposed Licence Holder has agreed "
                    "to the Vehicle being licensed in their name, and that the details "
                    "given to the Dealer for that purpose are those of the Proposed "
                    "Licence Holder.",
                    "The Proposed Licence Holder authorises the Dealer to lodge the "
                    "application to licence the Vehicle, and any supporting documents, "
                    "on their behalf by signing the application form.",
                ],
            )
        )

    blocks.extend(
        [
            (
                f"{len(blocks) + 1}. Electronic signature and documents",
                [
                    "The Purchaser consents to signing this authority electronically "
                    "and to receiving this authority, notices and other documents "
                    "relating to it electronically.",
                    "The Purchaser acknowledges that a copy of this authority was "
                    "provided to them electronically at the time they signed it.",
                ],
            ),
            (
                f"{len(blocks) + 2}. Identity documents",
                [
                    "The Purchaser consents to the Dealer collecting and holding a copy "
                    "of the Purchaser’s driver’s licence, and the personal details shown "
                    "on it, for the purpose of completing the licensing of the Vehicle.",
                ],
            ),
            (
                f"{len(blocks) + 3}. This is not a contract of sale",
                [
                    "This authority is not a contract for the sale of the Vehicle and "
                    "creates no obligation on the Purchaser to buy it or on the Dealer "
                    "to supply it. Any such contract is a separate agreement between "
                    "the parties.",
                ],
            ),
        ]
    )
    return blocks


def published_text(sale) -> str:
    """The instrument's wording as one markdown document, for publishing."""
    lines = [f"# {AGREEMENT_TITLE}", ""]
    for heading, paragraphs in clauses(sale):
        lines.append(f"## {heading}")
        lines.append("")
        lines.extend(paragraphs)
        lines.append("")
    return "\n".join(lines).strip() + "\n"


def _signature_block(signer_name="", signed_at=None):
    value = (
        f"Electronically signed by {signer_name}" if signer_name else "_" * 38
    )
    when = signed_at.strftime("%d/%m/%Y") if signed_at else "_" * 18
    table = Table(
        [
            [
                Paragraph("Purchaser signature", LABEL),
                Paragraph(value, VALUE),
                Paragraph("Date", LABEL),
                Paragraph(when, VALUE),
            ]
        ],
        colWidths=[35 * mm, 70 * mm, 15 * mm, 45 * mm],
    )
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
                ("TOPPADDING", (0, 0), (-1, -1), 14),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("LINEBELOW", (1, 0), (1, -1), 0.4, colors.HexColor("#d6d3d1")),
                ("LINEBELOW", (3, 0), (3, -1), 0.4, colors.HexColor("#d6d3d1")),
            ]
        )
    )
    return table


def build_authority_to_lodge(sale, dealer, profile, *, signer_name="", signed_at=None):
    """Return ``(filename, pdf_bytes)`` for this sale's Authority to Lodge."""
    trading_name = dealer.business_name
    story = [
        Paragraph("AUTHORITY TO LODGE A VEHICLE LICENCE APPLICATION", TITLE),
        Paragraph(
            "Given to the Dealer named below for the purpose of lodging an "
            "application with the Department of Transport (WA).",
            NOTE,
        ),
        Spacer(1, 6),
        rows_table(_party_rows(sale, dealer, profile), "PARTIES"),
        Spacer(1, 5),
        rows_table(_vehicle_rows(sale), "VEHICLE"),
        Paragraph("AUTHORITY", SECTION),
    ]
    for heading, paragraphs in clauses(sale):
        story.append(Paragraph(heading, PART_HEADING))
        story.extend(Paragraph(text, CLAUSE) for text in paragraphs)

    story.append(Paragraph("SIGNATURE", SECTION))
    story.append(
        Paragraph(
            "By signing, the Purchaser gives the Dealer the authority set out above.",
            BODY,
        )
    )
    story.append(_signature_block(signer_name=signer_name, signed_at=signed_at))

    pdf = build_document(
        story,
        title=f"Authority to Lodge {sale.reference}",
        author=trading_name,
        header=f"{trading_name} — Authority to Lodge",
        reference=sale.reference,
    )
    return f"authority-to-lodge-{sale.reference}.pdf", pdf
