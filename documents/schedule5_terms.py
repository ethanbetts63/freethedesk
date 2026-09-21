"""The prescribed Schedule 5 terms, reproduced verbatim.

Motor Vehicle Dealers (Sales) Regulations 1974 (WA), Schedule 5 [r. 13B], from
the current consolidation 03-j0-00 as at 7 Jun 2024 — the copy in
`_docs/licensing/wa_dealer_forms/`.

**Do not edit, reword, renumber or "tidy" any of this.** It is the prescribed
form of contract. Extracted mechanically from the legislation HTML rather than
retyped, because a typo in a prescribed term is a defective contract. Anything
that differs from these clauses is a Special Condition printed in its own
section, per cl 5.2; see `dealers/utils/special_conditions.py`.

Regenerate from the source rather than hand-patching if the regulations are
amended, and update the citation above when you do. The golden test in
`tests/util_tests/test_schedule5_terms.py` exists so that an amendment is caught
rather than reviewed — a reworded clause fails a hash, which is a better signal
than somebody reading two documents side by side.
"""

CITATION = (
    'Motor Vehicle Dealers (Sales) Regulations 1974 (WA), Schedule 5 [r. 13B], '
    'consolidation 03-j0-00 as at 7 Jun 2024'
)

# (part number, heading, [(clause number, text, [(label, text), ...]), ...])
PRESCRIBED_TERMS = [
    (
        1,
        "FORMATION",
        [
            (
                "1.1",
                "The signing of this Contract by the Purchaser means an offer has been made to purchase the Vehicle on the terms and conditions stated in this Contract.  No offer is made unless the Purchaser is provided with a copy of this Contract at the time it is signed by the Purchaser.",
                [],
            ),
            (
                "1.2",
                "The offer of the Purchaser is accepted by the Dealer when:",
                [
                    ("a", "this Contract is signed by the Dealer or a person authorised by the Dealer; and"),
                    ("b", "notice of the acceptance is given to the Purchaser.  This Contract will then be binding on both parties."),
                ],
            ),
            (
                "1.3",
                "The offer of the Purchaser may be withdrawn by the Purchaser any time before it is accepted by the Dealer.  It will automatically lapse at the close of business on the next normal business day for motor vehicle dealers.",
                [],
            ),
        ],
    ),
    (
        2,
        "FINANCE",
        [
            (
                "2.1",
                "Where this Contract is subject to the Purchaser obtaining finance, the Contract is conditional upon the Purchaser obtaining approval for the granting of a loan:",
                [
                    ("a", "before the Latest Time stated in the Contract;"),
                    ("b", "for the amount stated in the Contract;"),
                    ("c", "from the Lender named in the Contract (or a lender acceptable to the Purchaser); and"),
                    ("d", "upon reasonable terms and conditions in the circumstances."),
                ],
            ),
            (
                "2.2",
                "The Purchaser agrees to take all reasonable steps toward obtaining loan approval.",
                [],
            ),
            (
                "2.3",
                "If the Purchaser has taken all reasonable steps towards obtaining loan approval, but does not obtain approval, then either the Purchaser or the Dealer may terminate this Contract by giving Notice to the other party.  The Dealer must immediately refund any deposit paid and return any trade-in vehicle to the Purchaser.",
                [],
            ),
        ],
    ),
    (
        3,
        "THE PURCHASE PRICE",
        [
            (
                "3.1",
                "Upon delivery of the Vehicle, the Purchaser will pay to the Dealer all of the Total Purchase Price, less any deposit paid and any value given to the Trade-In Vehicle.",
                [],
            ),
            (
                "3.2",
                "In the case of a new Vehicle, if at any time after this Contract becomes binding on both parties but before delivery of the Vehicle to the Purchaser, the cost of the Vehicle to the Dealer changes because the manufacturer changes its price, or there is a change in statutory charges which apply to the Vehicle, the Total Purchase Price will be adjusted by the corresponding amount.",
                [],
            ),
            (
                "3.3",
                "If the manufacturer increases the cost of a new Vehicle to the Dealer, the Dealer is only entitled to pass on to the Purchaser, an increase of up to and including 5% of the Total Factory Price of the Vehicle.",
                [],
            ),
            (
                "3.4",
                "Payment by cheque for all or part of the Total Purchase Price will not be considered to have been received by the Dealer until the cheque has been honoured.",
                [],
            ),
        ],
    ),
    (
        4,
        "DELIVERY OF THE VEHICLE",
        [
            (
                "4.1",
                "The Dealer will deliver the Vehicle to the Purchaser on or before the delivery date stated in this Contract.",
                [],
            ),
            (
                "4.2",
                "In the case of a new Vehicle, if a Delivery Date is not stated in this Contract, the Dealer will deliver the Vehicle within three (3) months of this Contract becoming binding on the parties.",
                [],
            ),
            (
                "4.3",
                "In the case of a used Vehicle, if a Delivery Date is not stated in this Contract, the Dealer will deliver the Vehicle within one (1) month of this Contract becoming binding on the parties.",
                [],
            ),
            (
                "4.4",
                "Delivery of the Vehicle to the Purchaser will take place at the Dealer’s Premises, unless other arrangements are agreed to between the Purchaser and the Dealer.",
                [],
            ),
            (
                "4.5",
                "The Purchaser will deliver any Trade-In Vehicle to the Dealer, and take delivery of the Vehicle, within seven (7) days of being notified by the Dealer that the Vehicle is ready for collection.",
                [],
            ),
        ],
    ),
    (
        5,
        "PASSING OF PROPERTY AND RISK IN THE VEHICLE",
        [
            (
                "5.1",
                "The Dealer remains the owner of the Vehicle until the Total Purchase Price has been received in full by the Dealer.",
                [],
            ),
            (
                "5.2",
                "Risk in the Vehicle and the responsibility to insure the Vehicle will pass from the Dealer to the Purchaser when the Vehicle is delivered by the Dealer to the Purchaser, unless the Purchaser and the Dealer agree to some other arrangement and include it as a Special Condition of this Contract.  This applies whether delivery occurs at the Dealer’s Premises or any other location.",
                [],
            ),
        ],
    ),
    (
        6,
        "TRADE-IN VEHICLE",
        [
            (
                "6.1",
                "The Purchaser will deliver the Trade-In Vehicle with Accessories to the Dealer in the same condition the Trade-In Vehicle was in at the time it was valued by the Dealer for the purpose of this Contract, except for normal wear and tear.",
                [],
            ),
        ],
    ),
    (
        7,
        "PURCHASER’S RIGHT TO TERMINATE THIS CONTRACT",
        [
            (
                "7.1",
                "The Purchaser may terminate this Contract if the Dealer has breached any of the obligations imposed on the Dealer by this Contract.",
                [],
            ),
            (
                "7.2",
                "If this Contract is validly terminated by the Purchaser, the Dealer must immediately refund any deposit paid and return any Trade-In Vehicle to the Purchaser.  If, in the event the Trade-In Vehicle has been sold, the cash equivalent of the Trade-In Vehicle value determined at the commencement of the Contract shall be refunded to the Purchaser.",
                [],
            ),
        ],
    ),
    (
        8,
        "DEALER’S RIGHT TO TERMINATE THIS CONTRACT",
        [
            (
                "8.1",
                "The Dealer may terminate this Contract if the Purchaser has breached any of the obligations imposed on the Purchaser by this Contract.",
                [],
            ),
            (
                "8.2",
                "If this Contract is validly terminated by the Dealer, the Dealer may seek an amount up to, but not exceeding, 5% of the Total Purchase Price of the Vehicle as pre-estimated damages.",
                [],
            ),
            (
                "8.3",
                "Any amount sought by the Dealer under Clause 8.2 must be a genuine estimate of the Dealer’s loss arising from the Purchaser’s breach of the obligations imposed on the Purchaser by this Contract.",
                [],
            ),
            (
                "8.4",
                "Any deposit paid by the Purchaser may be used by the Dealer to meet the pre-estimated damages payable by the Purchaser. Any surplus will be refunded to the Purchaser.",
                [],
            ),
        ],
    ),
    (
        9,
        "NOTICES",
        [
            (
                "9.1",
                "All Notices required by this Contract may be given by direct communication, telephone, electronically, fax or post to the addresses and numbers included in this Contract.",
                [],
            ),
            (
                "9.2",
                "If sent by post, a Notice will be considered to have been received, unless the contrary is shown, at the time when the Notice would have been delivered in the ordinary course of the post.",
                [],
            ),
        ],
    ),
]
