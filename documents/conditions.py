"""Which Special Conditions print on one sale's contract.

Two filters, applied in order. The dealer's own set decides which defaults exist
at all — that is the choice recorded at onboarding. The sale then decides which
of those apply to it: a condition about where a vehicle is delivered has no
business on a contract for one being collected from the yard.

The dealer's additions are printed after the defaults, numbered from SC11, and
are never filtered. They were written for this dealer's business by this dealer
and nothing here knows enough to decide when one of them applies.
"""

from dealers.utils import special_conditions

#: Additions start above the highest default. The gap where SC8 would be is
#: kept rather than closed, so a contract from this system stays comparable
#: clause by clause with allbikes' — see `special_conditions.py`.
FIRST_ADDITION_NUMBER = 11


def _applies(condition, sale) -> bool:
    if condition.scope == "delivery":
        return sale.requires_delivery
    if condition.scope == "new_stock":
        # SC5's justification is a first-licensing problem, and this corrects
        # allbikes, which prints it on every contract. A used vehicle is already
        # licensed, MR9B is lodged within seven days of sale, and nothing
        # requires transfer before delivery — on the used path prescribed cl 3.1
        # works unmodified.
        return not sale.is_used_stock
    return True


def sale_context(sale, dealer, profile) -> dict:
    """The per-sale values the clause text is written around."""
    delivery = ", ".join(
        part
        for part in (
            sale.delivery_address_line1,
            sale.delivery_suburb,
            sale.delivery_state,
            sale.delivery_postcode,
        )
        if part
    )
    licence_holder = " ".join(
        part for part in (sale.licence_given_names, sale.licence_family_name) if part
    )
    return {
        "delivery_address": delivery or "the address agreed between the parties",
        "licence_holder_name": licence_holder or "the proposed licence holder",
        "purchaser_email": sale.customer_email,
        "dealer_email": dealer.user.email,
    }


def conditions_for(sale, dealer, profile):
    """The conditions this contract prints, in printing order.

    Returns a list of ``(number, heading, [paragraph, ...])``.
    """
    choices = special_conditions.normalise_choices(profile.condition_choices)
    context = sale_context(sale, dealer, profile)
    printed = []

    for condition in special_conditions.DEFAULT_CONDITIONS:
        if not choices["defaults"].get(condition.number, True):
            continue
        if not _applies(condition, sale):
            continue
        # SC2 forks on whether the person buying is the person being licensed.
        # A vehicle bought by one person and licensed to another is an ordinary
        # sale, and the fork names the proposed licence holder, records their
        # agreement, carries their authority to lodge, and states that none of
        # it makes them a party to the contract.
        alternative = bool(condition.alternative_paragraphs) and not sale.purchaser_is_licence_holder
        heading = condition.alternative_heading if alternative else condition.heading
        printed.append(
            (
                condition.number,
                heading,
                special_conditions.render(condition, context, alternative=alternative),
            )
        )

    for offset, addition in enumerate(choices["additions"]):
        printed.append(
            (
                f"SC{FIRST_ADDITION_NUMBER + offset}",
                addition["heading"],
                list(addition["paragraphs"]),
            )
        )

    return printed
