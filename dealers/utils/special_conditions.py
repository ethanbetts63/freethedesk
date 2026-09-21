"""The default Special Conditions a dealer approves at onboarding.

A term that varies a prescribed Schedule 5 clause has to be part of the contract
itself — cl 5.2 speaks of including something "as a Special Condition of this
Contract" — so these are printed on the face of the contract rather than linked
from it. A terms page would be the reg 14 problem rather than a way around it.

**Draft wording, not reviewed by a WA lawyer.** That review is a version bump:
the set below is published as a `freetheplatform.agreements` version, so
replacing the text is publishing a new version rather than a migration or a
redeploy. Nothing waits on it. Source:
`_docs/licensing/research/contract_special_conditions.md`.

Two things are deliberately absent.

**There is no SC8.** Allbikes caps the dealer's pre-estimated damages at the
card processing fee it actually incurred, because allbikes takes the deposit
through its own Stripe account and has a real `balance_transaction.fee` to point
at. FreeTheDesk never touches the money — it moves customer-to-dealer by BSB —
so a clause whose amount is a fee nobody in the transaction incurred is not a
genuine pre-estimate under cl 8.3. Prescribed cl 8.2 operates unmodified, capped
at 5% of the total purchase price. The numbering keeps its gap rather than
closing it, so a contract from either system is comparable clause by clause.

**There is no clause library.** A catalogue of optional extras with guidance on
when each applies is the shape that crosses the line drawn in
`_docs/licensing/research/findings-2026-08-30.md` section 6. A dealer reads each
default, keeps or removes it, and writes their own if they want more. Their
additions are never reviewed, validated or commented on.
"""

from dataclasses import dataclass

#: Bumped when the wording below changes. It is the version string of the
#: published agreement, so a dealer's recorded acceptance names the exact text
#: they read. Changing a paragraph without changing this would leave two
#: different sets of words sharing one version.
VERSION = "2026-09-19"

AGREEMENT_KEY = "dealer.special_conditions"
AGREEMENT_TITLE = "Vehicle Sale Contract — Special Conditions"

ACCEPTANCE_STATEMENT = (
    "I have read each of these Special Conditions, I have chosen which of them "
    "to include in my Vehicle Sale Contracts, and I accept responsibility for "
    "the conditions I have added."
)


@dataclass(frozen=True)
class SpecialCondition:
    """One clause, with the rule for when it prints.

    ``paragraphs`` are format strings. The values they take differ by audience:
    a dealer reading the clause at onboarding sees a description of what will go
    there, and a customer reading their own contract sees the actual address and
    the actual email. One text, two substitutions, rather than two texts.
    """

    number: str
    heading: str
    paragraphs: tuple[str, ...]
    #: ``always``, ``delivery`` or ``new_stock``. Data rather than a lambda so
    #: that the onboarding screen can state the rule in words.
    scope: str
    #: Plain English, shown to the dealer beside the clause.
    applies: str
    #: SC2 and SC6 cannot be removed: SC2 is the authority to lodge and SC6 is
    #: the consent to sign electronically, and without either the product does
    #: not function. That is a statement about the product, not advice about the
    #: dealer's business.
    removable: bool = True
    #: Used in place of ``paragraphs`` when the purchaser is not the person the
    #: vehicle is being licensed to. Only SC2 has one.
    alternative_heading: str = ""
    alternative_paragraphs: tuple[str, ...] = ()


DEFAULT_CONDITIONS: tuple[SpecialCondition, ...] = (
    SpecialCondition(
        number="SC1",
        heading="Place of delivery",
        scope="delivery",
        applies="Sales you deliver, rather than ones collected from your premises.",
        paragraphs=(
            "Clause 4.4 provides that delivery takes place at the Dealer’s Premises "
            "unless otherwise agreed. The parties agree that the Vehicle will instead "
            "be delivered to the Purchaser at:",
            "{delivery_address}",
            "on the delivery date stated in this Contract, at a time agreed between "
            "the parties in advance.",
            "If the Purchaser is not present to accept delivery at the agreed date and "
            "time, and has not given the Dealer reasonable notice beforehand, the "
            "Dealer may charge the Purchaser its reasonable cost of making a further "
            "delivery attempt.",
        ),
    ),
    SpecialCondition(
        number="SC2",
        heading="Authority to licence the Vehicle",
        scope="always",
        applies="Every sale. Without it you cannot lodge on the customer’s behalf.",
        removable=False,
        paragraphs=(
            "The Purchaser appoints the Dealer as their authorised representative for "
            "the purpose of lodging the application to licence the Vehicle with the "
            "Department of Transport, and authorises the Dealer to lodge that "
            "application and any supporting documents on the Purchaser’s behalf.",
        ),
        alternative_heading="Licensing of the Vehicle in another person’s name",
        alternative_paragraphs=(
            "The parties agree that the Vehicle is to be licensed in the name of:",
            "{licence_holder_name} (the Proposed Licence Holder)",
            "The Purchaser confirms that the Proposed Licence Holder has agreed to the "
            "Vehicle being licensed in their name, and that the details given to the "
            "Dealer for that purpose are those of the Proposed Licence Holder.",
            "The Proposed Licence Holder authorises the Dealer to lodge the application "
            "to licence the Vehicle, and any supporting documents, on their behalf by "
            "signing the application form. Nothing in this Special Condition makes the "
            "Proposed Licence Holder a party to this Contract.",
        ),
    ),
    SpecialCondition(
        number="SC3",
        heading="Change of colour or specification",
        scope="new_stock",
        applies="New stock only. A used vehicle is the one in front of the customer.",
        paragraphs=(
            "If the manufacturer or importer discontinues or is unable to supply the "
            "colour or specification stated in this Contract, the Dealer will notify "
            "the Purchaser and may offer an alternative.",
            "The Purchaser is not obliged to accept an alternative. If the Purchaser "
            "does not accept an alternative offered by the Dealer, either party may "
            "terminate this Contract by Notice to the other, and the Dealer must "
            "immediately refund any deposit paid. No damages are payable by either "
            "party under this Special Condition.",
            "If the Purchaser accepts an alternative, the parties will record the "
            "change in writing before the Dealer proceeds.",
        ),
    ),
    SpecialCondition(
        number="SC4",
        heading="Revision of the delivery date",
        scope="new_stock",
        applies="New stock only. It is about a supply date the manufacturer sets.",
        paragraphs=(
            "The delivery date stated in this Contract is based on the supply date "
            "advised to the Dealer by the manufacturer or importer.",
            "If the Dealer becomes aware before the stated delivery date that the "
            "Vehicle will not be available in time, the Dealer will notify the "
            "Purchaser as soon as practicable and the parties may agree a revised "
            "delivery date in writing. The Purchaser is not obliged to agree to a "
            "revised date.",
            "Nothing in this Special Condition limits the Purchaser’s rights under "
            "clause 7.1 if the Vehicle is not delivered by the delivery date stated in "
            "this Contract or by any revised date agreed in writing.",
        ),
    ),
    SpecialCondition(
        number="SC5",
        heading="Payment of the balance before delivery",
        scope="new_stock",
        applies=(
            "New stock only. Its reason is a first-licensing problem, and a used "
            "vehicle is already licensed."
        ),
        paragraphs=(
            "Clause 3.1 provides for the balance of the Total Purchase Price to be "
            "paid on delivery. The parties agree that the balance is instead payable "
            "when the Dealer notifies the Purchaser that the Vehicle is ready to be "
            "licensed.",
            "This is because the Department of Transport will only accept proof of "
            "ownership that shows the Vehicle has been paid for in full, and the "
            "Vehicle must be licensed before it can be delivered to the Purchaser.",
            "Clause 5.1 continues to apply: the Dealer remains the owner of the "
            "Vehicle until the Total Purchase Price has been received in full.",
        ),
    ),
    SpecialCondition(
        number="SC6",
        heading="Notices and electronic documents",
        scope="always",
        applies="Every sale. Without it nothing here can be signed electronically.",
        removable=False,
        paragraphs=(
            "The Purchaser consents to signing this Contract electronically and to "
            "receiving this Contract, notices and other documents relating to it "
            "electronically.",
            "For the purposes of clause 9.1, Notices may be given by email to:",
            "Purchaser: {purchaser_email}",
            "Dealer: {dealer_email}",
            "The Purchaser acknowledges that a copy of this Contract was provided to "
            "them electronically at the time they signed it.",
        ),
    ),
    SpecialCondition(
        number="SC7",
        heading="Risk in the Vehicle",
        scope="delivery",
        applies=(
            "Deliveries only, and confirmatory rather than a variation — the "
            "prescribed clause already produces this outcome."
        ),
        paragraphs=(
            "For the avoidance of doubt, and despite the change to the place of "
            "delivery in SC1, clause 5.2 applies unchanged: risk in the Vehicle and "
            "the responsibility to insure it pass from the Dealer to the Purchaser "
            "when the Vehicle is delivered.",
        ),
    ),
    SpecialCondition(
        number="SC9",
        heading="Delivery inspection",
        scope="delivery",
        applies="Deliveries only.",
        paragraphs=(
            "On delivery the Purchaser will inspect the Vehicle and take photographs "
            "of it, and will tell the Dealer as soon as reasonably possible about any "
            "damage that appears to have occurred in transit.",
            "Nothing in this Special Condition limits the Purchaser’s rights under the "
            "Australian Consumer Law, or the Dealer’s obligations under it, including "
            "where damage or a defect is discovered later.",
        ),
    ),
    SpecialCondition(
        number="SC10",
        heading="Identity documents",
        scope="always",
        applies="Every sale.",
        paragraphs=(
            "The Purchaser consents to the Dealer collecting and holding a copy of the "
            "Purchaser’s driver’s licence, and the personal details shown on it, for "
            "the purpose of completing the licensing of the Vehicle.",
        ),
    ),
)

BY_NUMBER = {condition.number: condition for condition in DEFAULT_CONDITIONS}

#: Cannot be switched off, in the API as well as in the interface.
REQUIRED_NUMBERS = frozenset(
    condition.number for condition in DEFAULT_CONDITIONS if not condition.removable
)

#: What a dealer sees where a per-sale value will go. Not a placeholder token —
#: they are reading the clause to decide whether to keep it, and "{delivery_address}"
#: tells them less than a sentence does.
SAMPLE_CONTEXT = {
    "delivery_address": "[the delivery address for that sale]",
    "licence_holder_name": "[the name of the proposed licence holder]",
    "purchaser_email": "[the customer’s email address]",
    "dealer_email": "[your email address]",
}


def render(condition: SpecialCondition, context: dict, *, alternative: bool = False):
    """The clause's paragraphs with its per-sale values filled in.

    ``format_map`` rather than ``format`` so a context missing a key raises at
    the point of rendering instead of producing a contract with a brace in it.
    """
    paragraphs = (
        condition.alternative_paragraphs if alternative else condition.paragraphs
    )
    return [paragraph.format_map(context) for paragraph in paragraphs]


def default_choices() -> dict:
    """Everything kept, which is what a dealer who has chosen nothing gets.

    The defaults are on rather than off deliberately. A dealer who has not
    opened this screen should have a contract carrying the authority to lodge
    and the consent to sign electronically, because without them the product
    they have paid for does not work.
    """
    return {
        "defaults": {condition.number: True for condition in DEFAULT_CONDITIONS},
        "additions": [],
    }


def normalise_choices(stored) -> dict:
    """Read stored choices, filling in anything the stored copy does not answer.

    A clause added to the catalogue after a dealer last saved is absent from
    their stored map, and the honest reading of that absence is "they have not
    seen it" — so it defaults to on, the same as for a dealer who has never
    opened the screen. A number that is no longer in the catalogue is dropped
    rather than carried.
    """
    choices = default_choices()
    if not isinstance(stored, dict):
        return choices
    stored_defaults = stored.get("defaults")
    if isinstance(stored_defaults, dict):
        for number in choices["defaults"]:
            if number in stored_defaults:
                choices["defaults"][number] = bool(stored_defaults[number])
    for number in REQUIRED_NUMBERS:
        choices["defaults"][number] = True
    additions = stored.get("additions")
    if isinstance(additions, list):
        choices["additions"] = [
            {
                "heading": str(entry.get("heading", "")),
                "paragraphs": [str(text) for text in entry.get("paragraphs", []) if str(text).strip()],
            }
            for entry in additions
            if isinstance(entry, dict)
        ]
    return choices


def published_text() -> str:
    """The whole default set as one markdown document.

    This is what gets published as the agreement version and what a dealer's
    acceptance points at, so it has to be the clause text itself rather than a
    summary of it. Built from the catalogue rather than kept as a second file:
    two copies of a contract term is one copy that can be edited without the
    other.
    """
    lines = [
        f"# {AGREEMENT_TITLE}",
        "",
        "These Special Conditions are printed on the face of the Vehicle Sale "
        "Contract prescribed by Schedule 5 of the Motor Vehicle Dealers (Sales) "
        "Regulations 1974 (WA). Where a Special Condition varies a prescribed "
        "clause, the Special Condition applies.",
        "",
    ]
    for condition in DEFAULT_CONDITIONS:
        lines.append(f"## {condition.number} — {condition.heading}")
        lines.append("")
        lines.append(f"_Applies: {condition.applies}_")
        lines.append("")
        lines.extend(paragraph for paragraph in render(condition, SAMPLE_CONTEXT))
        lines.append("")
        if condition.alternative_paragraphs:
            lines.append(
                f"### {condition.number} — {condition.alternative_heading} "
                "(where the purchaser is not the licence holder)"
            )
            lines.append("")
            lines.extend(render(condition, SAMPLE_CONTEXT, alternative=True))
            lines.append("")
    return "\n".join(lines).strip() + "\n"
