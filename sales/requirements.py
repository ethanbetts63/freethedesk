"""What can happen next on a sale, answered once.

One function, and both the customer's own screen and the dealer's checklist
render from it. That is the point rather than a convenience: two implementations
of "can they sign yet" disagree eventually, and the way it surfaces is a
customer being shown a button that returns 409 — or worse, a dealer being told a
sale is ready when it is not.

The API never trusts the client's reading of this. Every write re-derives it
server-side and refuses with a 409 and a sentence, so a stale tab is a clear
message rather than a corrupted sale.

The order of the three gates is fixed by law rather than by preference:

1. **Details**, because everything downstream prints them.
2. **Identity**, because a vehicle gets licensed in someone's name before
   anything downstream would catch a fraud.
3. **The warranty statement**, because reg 7 requires it be given *before* the
   dealer sells, not bundled into the pack afterwards.

See `_docs/licensing/plan/02-sale-flow.md` and `05-customer-flow.md`.
"""

from documents.api import document_rows
from documents.warranty import warranty_notice
from identity.api import verification_for_sale


def has_licensing_details(sale) -> bool:
    """Enough of the customer's identity to fill their licensing form.

    Identity only, deliberately. This is also what decides whether the customer
    has finished their part of the sale, and a vehicle colour they have not
    confirmed is not a reason to hold up their paperwork.
    """
    required = [
        sale.licence_family_name,
        sale.licence_given_names,
        sale.licence_number,
        sale.licence_date_of_birth,
        sale.licensee_address_line1,
        sale.licensee_suburb,
        sale.licensee_postcode,
    ]
    if not sale.purchaser_is_licence_holder:
        required.extend(
            [
                sale.purchaser_family_name,
                sale.purchaser_given_names,
                sale.purchaser_address_line1,
                sale.purchaser_suburb,
                sale.purchaser_postcode,
            ]
        )
    if sale.licensed_to_company:
        required.extend([sale.company_name, sale.company_acn])
    if sale.requires_delivery:
        required.extend([sale.delivery_address_line1, sale.delivery_suburb, sale.delivery_postcode])
    return all(required)


def identity_verified(sale) -> bool:
    """Whether identity has been satisfied, however it was satisfied.

    Reads ``sale.verification`` if there is one and answers ``False`` when there
    is not. The sale knows nothing about how a verdict was reached, which is the
    whole shape of the identity step: a provider swap sets the same flag and
    nothing here moves.
    """
    verification = verification_for_sale(sale)
    return bool(verification and verification.is_verified)


def customer_requirements(sale, *, documents=None, warranty=None) -> dict:
    """The single answer to what this sale needs next.

    ``documents`` and ``warranty`` are the same two derivations a serializer has
    usually already made for its own fields. Passing them in is what stops one
    response computing the document list three times; leaving them out computes
    them, so every other caller stays a one-argument call.
    """
    details_complete = has_licensing_details(sale)
    verified = identity_verified(sale)
    warranty = warranty_notice(sale) if warranty is None else warranty
    warranty_acknowledged = warranty["acknowledged"]

    documents = document_rows(sale) if documents is None else documents
    # A document that was signed and is now stale does not count as signed. The
    # customer has to go back and sign the version that matches their sale, or
    # the Department receives a name the sale no longer says.
    documents_signed = bool(documents) and all(
        row["signed"] and not row["is_stale"] for row in documents
    )

    can_sign = details_complete and verified and warranty_acknowledged
    customer_marked_paid = sale.customer_marked_paid_at is not None
    payment_confirmed = sale.payment_confirmed_at is not None
    # Payment instructions appear only after the dealer has accepted the offer.
    # Before that there is no contract, and asking a customer to transfer money
    # against an offer nobody has accepted is asking them to pay for nothing.
    can_open_payment = documents_signed and sale.accepted_at is not None

    if not details_complete:
        next_action = "details"
    elif not verified:
        next_action = "verify"
    elif not warranty_acknowledged or not documents_signed:
        next_action = "sign"
    elif not payment_confirmed:
        next_action = "payment"
    else:
        next_action = "done"

    return {
        "details_complete": details_complete,
        "identity_verified": verified,
        "warranty_acknowledged": warranty_acknowledged,
        "documents_signed": documents_signed,
        "customer_marked_paid": customer_marked_paid,
        "payment_confirmed": payment_confirmed,
        "can_sign": can_sign,
        "can_open_payment": can_open_payment,
        "next_action": next_action,
    }


def details_are_editable(sale, *, requirements=None) -> bool:
    """Whether the customer may still change what prints on their documents.

    Editable for as long as they still have something to do, not only on the
    first pass. These details print onto the documents they are about to sign,
    so noticing a misspelt name at the moment of signing is precisely when it
    should be fixable — refusing would send the wrong name to the Department of
    Transport rather than prevent it.

    The door closes when their checklist is empty. From then on a change is a
    conversation with the dealer, who can still make it.
    """
    if requirements is None:
        requirements = customer_requirements(sale)
    return requirements["next_action"] != "done"
