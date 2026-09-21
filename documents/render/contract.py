"""The Schedule 5 Vehicle Sale Contract.

Unlike VL17 and MR9B there is no fillable PDF to hand: Schedule 5 is a form of
words in the regulations, not a published form, so the document is typeset. The
prescribed terms are reproduced verbatim from ``schedule5_terms`` and are never
reworded; anything that differs from them is a Special Condition printed in its
own section, per cl 5.2.

**Signature fields are blank until signed.** Clause 1.1 makes signing the
Purchaser's offer, and pre-signing on their behalf would forge the one act the
clause is about.
"""

from decimal import Decimal

from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import KeepTogether, Paragraph, Spacer, Table, TableStyle

from documents.conditions import conditions_for
from documents.schedule5_terms import CITATION, PRESCRIBED_TERMS

from .pdf import (
    BODY,
    CLAUSE,
    LABEL,
    NOTE,
    PART_HEADING,
    SECTION,
    SUBCLAUSE,
    TITLE,
    VALUE,
    build_document,
    rows_table,
)


class SaleContractError(Exception):
    """The sale is not complete enough to put a contract in front of a customer."""


def _amount(value):
    """``'$4,850.00'`` — symbol and separators, for prose a person reads."""
    return f"${Decimal(value or 0):,.2f}"


def _date(value):
    return value.strftime("%d/%m/%Y") if value else ""


def _address(*parts):
    return ", ".join(part for part in parts if part)


def _vehicle_description(sale):
    parts = [str(sale.year or ""), sale.make, sale.model_name]
    described = " ".join(part for part in parts if part)
    return f"{described} — {sale.colour}" if sale.colour else described


def _registration_expiry(sale):
    """When the registration the Purchaser is getting runs out.

    Two different answers, because the two kinds of stock are two different
    situations. A used vehicle carries the registration already on it, so the
    expiry is a date the sale holds. A new one is not licensed yet and has no
    date to give — the term is what is included in the price and it starts
    running when the dealer licenses it, so that is what the contract says
    rather than a date it would be guessing at.
    """
    if not sale.is_used_stock:
        if sale.registration_months_included:
            return f"{sale.registration_months_included} months from the licensing date"
        return "To be advised on licensing"
    return _date(sale.registration_expiry) if sale.registration_expiry else "Not recorded"


def _engine_capacity(sale):
    """Displacement, or the reason there is not one.

    An electric vehicle has no capacity to state, and a blank cell would read as
    a missing figure rather than an inapplicable one.
    """
    if sale.engine_capacity_cc:
        return f"{sale.engine_capacity_cc}cc"
    return "Electric" if sale.is_electric else "Not recorded"


def _purchaser_rows(sale):
    purchaser = (
        " ".join(part for part in (sale.licence_given_names, sale.licence_family_name) if part)
        if sale.purchaser_is_licence_holder
        else " ".join(
            part for part in (sale.purchaser_given_names, sale.purchaser_family_name) if part
        )
    )
    licensed_to = " ".join(
        part for part in (sale.licence_given_names, sale.licence_family_name) if part
    )
    rows = [
        ("Purchaser", purchaser or sale.customer_name),
        (
            "Address",
            _address(sale.purchaser_address_line1, sale.purchaser_suburb, sale.purchaser_postcode)
            if not sale.purchaser_is_licence_holder
            else _address(sale.licensee_address_line1, sale.licensee_suburb, sale.licensee_postcode),
        ),
        ("Email (cl 9.1)", sale.customer_email),
        ("Phone", sale.customer_phone),
        ("Licence in the name of", licensed_to),
        ("Driver’s licence no.", sale.licence_number),
        ("Date of birth", _date(sale.licence_date_of_birth)),
    ]
    if not sale.purchaser_is_licence_holder:
        rows.append(
            (
                "Licence holder address",
                _address(sale.licensee_address_line1, sale.licensee_suburb, sale.licensee_postcode),
            )
        )
    return rows


def _seller_rows(dealer, profile):
    return [
        ("Dealer", profile.legal_name or dealer.business_name),
        ("Trading as", dealer.business_name),
        ("Dealer licence number", profile.dealer_licence_number),
        ("ABN", profile.abn),
        ("Dealer’s Premises", _address(profile.address_line1, profile.suburb, profile.postcode)),
        ("Email (cl 9.1)", dealer.user.email),
    ]


def _vehicle_rows(sale):
    return [
        ("Vehicle", _vehicle_description(sale)),
        ("Condition", sale.get_condition_display()),
        ("Engine capacity", _engine_capacity(sale)),
        ("Stock number", sale.stock_number),
        ("VIN", sale.vin or "To be advised on arrival"),
        ("Engine number", sale.engine_number or "To be advised on arrival"),
        (
            "Odometer",
            f"{sale.odometer_km:,} km" if sale.odometer_km is not None else "Not recorded",
        ),
        ("Registration", sale.registration or "Unregistered"),
        ("Registration expiry", _registration_expiry(sale)),
        # Clause 4.1 makes the stated date the obligation and cl 4.2 only
        # supplies the three-month default where none is stated, so stating one
        # is a real decision rather than a formatting one. Nothing in the sale
        # holds a delivery date yet, so the contract says which default applies
        # rather than inventing a date the dealer would then be bound by.
        (
            "Delivery date",
            "Not stated — clause 4.2 applies"
            if not sale.is_used_stock
            else "Not stated — clause 4.3 applies",
        ),
    ]


def _payment_rows(sale):
    return [
        ("Vehicle price", _amount(sale.vehicle_price)),
        ("Delivery fee", _amount(sale.delivery_fee)),
        ("Total Purchase Price (inc. GST)", _amount(sale.total_amount)),
        ("Deposit paid", _amount(sale.deposit_amount)),
        ("Balance payable", _amount(sale.balance_amount)),
        # Marked rather than left blank. A blank field on a contract reads as
        # something forgotten.
        ("Trade-In Vehicle", "N/A"),
        ("Finance", "N/A"),
        ("Sale reference", sale.reference),
    ]


SMALL_PRINT = ParagraphStyle(
    "small-print", fontName="Helvetica", fontSize=6.5, leading=8,
    textColor=colors.HexColor("#555555"),
)


def _signature_block(
    purchaser_signature="", signed_at=None, dealer_signature="", accepted_at=None,
    purchaser_signature_image=None,
):
    """A conventional signature line until somebody actually signs.

    A drawn signature (a validated ``freetheplatform.signatures``
    ``SignatureImage``) renders as the drawing with the electronic-signing
    small print beneath it; the typed-name line stays as the fallback.
    """

    def line(value):
        return Paragraph(f"Electronically signed by {value}" if value else "_" * 38, VALUE)

    def when(value):
        return Paragraph(value.strftime("%d/%m/%Y") if value else "_" * 18, VALUE)

    if purchaser_signature_image is not None:
        from freetheplatform.signatures import signature_flowable

        # A plain list: the cell keeps its contents together itself, and
        # KeepTogether inside a table cell derails reportlab's height maths.
        purchaser_cell = [
            signature_flowable(purchaser_signature_image, max_width=65 * mm, max_height=16 * mm),
            Paragraph(f"Electronically signed by {purchaser_signature}", SMALL_PRINT),
        ]
    else:
        purchaser_cell = line(purchaser_signature)

    data = [
        [
            Paragraph("Purchaser signature", LABEL),
            purchaser_cell,
            Paragraph("Date", LABEL),
            when(signed_at),
        ],
        [
            Paragraph("Dealer signature", LABEL),
            line(dealer_signature),
            Paragraph("Date", LABEL),
            when(accepted_at),
        ],
    ]
    table = Table(data, colWidths=[35 * mm, 70 * mm, 15 * mm, 45 * mm])
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
                ("TOPPADDING", (0, 0), (-1, -1), 12),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("LINEBELOW", (1, 0), (1, -1), 0.4, colors.HexColor("#d6d3d1")),
                ("LINEBELOW", (3, 0), (3, -1), 0.4, colors.HexColor("#d6d3d1")),
            ]
        )
    )
    return table


def can_build_sale_contract(sale) -> bool:
    """A contract needs named parties and a price to be a contract.

    Spelled out rather than hidden behind a model property: on the ordinary sale
    the buyer is the licence holder and the purchaser half is trivially
    satisfied, and a predicate that is almost always true reads like a gate
    while doing nothing. It only bites when somebody has said they are buying
    for another person and then not said who.
    """
    buyer_named = sale.purchaser_is_licence_holder or all(
        (
            sale.purchaser_family_name,
            sale.purchaser_given_names,
            sale.purchaser_address_line1,
            sale.purchaser_suburb,
            sale.purchaser_postcode,
        )
    )
    return bool(
        sale.licence_family_name
        and sale.licence_given_names
        and buyer_named
        and sale.vehicle_price is not None
        and sale.balance_amount is not None
    )


def build_sale_contract(
    sale, dealer, profile, *, purchaser_signature="", signed_at=None,
    dealer_signature="", accepted_at=None, purchaser_signature_image=None,
):
    """Return ``(filename, pdf_bytes)`` for this sale's contract.

    Unlike the licensing form this genuinely refuses: a contract missing the
    parties or the price is not a contract, so it raises rather than producing
    one with gaps in the places that identify who is bound.
    """
    if not can_build_sale_contract(sale):
        raise SaleContractError(
            "This sale does not have the customer details needed to draw up a "
            "contract yet."
        )

    trading_name = dealer.business_name
    story = [
        Paragraph("VEHICLE SALE CONTRACT", TITLE),
        Paragraph(CITATION, NOTE),
        Spacer(1, 6),
        rows_table(_purchaser_rows(sale), "PURCHASER DETAILS"),
        Spacer(1, 5),
        rows_table(_seller_rows(dealer, profile), "SELLER DETAILS"),
        Spacer(1, 5),
        rows_table(_vehicle_rows(sale), "VEHICLE DETAILS"),
        Spacer(1, 5),
        rows_table(_payment_rows(sale), "PAYMENT DETAILS"),
        Paragraph("SPECIAL CONDITIONS", SECTION),
        Paragraph(
            "These Special Conditions form part of this Contract. Where a Special "
            "Condition varies a term below, the Special Condition applies.",
            BODY,
        ),
        Spacer(1, 4),
    ]

    for number, heading, paragraphs in conditions_for(sale, dealer, profile):
        block = [Paragraph(f"{number} — {heading}", PART_HEADING)]
        block.extend(Paragraph(text, CLAUSE) for text in paragraphs)
        story.append(KeepTogether(block))

    story.append(Paragraph("TERMS AND CONDITIONS (PLEASE READ CAREFULLY)", SECTION))
    for part_number, part_heading, clauses in PRESCRIBED_TERMS:
        story.append(Paragraph(f"{part_number}. {part_heading}", PART_HEADING))
        for clause_number, text, subs in clauses:
            story.append(Paragraph(f"{clause_number}&nbsp;&nbsp;{text}", CLAUSE))
            for label, sub_text in subs:
                story.append(Paragraph(f"({label})&nbsp;&nbsp;{sub_text}", SUBCLAUSE))

    story.append(Paragraph("SIGNATURES", SECTION))
    story.append(
        Paragraph("<b>Please read the Terms and Conditions above before signing.</b>", BODY)
    )
    story.append(Spacer(1, 4))
    story.append(
        Paragraph(
            "Clause 1.1: signing this Contract is the Purchaser’s offer to buy the "
            "Vehicle, and no offer is made unless the Purchaser is given a copy of "
            "this Contract at the time they sign it. Clause 1.2: the Contract binds "
            "both parties only once the Dealer has signed and given the Purchaser "
            "notice of acceptance.",
            BODY,
        )
    )
    story.append(
        _signature_block(
            purchaser_signature=purchaser_signature,
            signed_at=signed_at,
            dealer_signature=dealer_signature,
            accepted_at=accepted_at,
            purchaser_signature_image=purchaser_signature_image,
        )
    )

    pdf = build_document(
        story,
        title=f"Vehicle Sale Contract {sale.reference}",
        author=trading_name,
        header=f"{trading_name} — Vehicle Sale Contract",
        reference=sale.reference,
    )
    return f"vehicle-sale-contract-{sale.reference}.pdf", pdf
