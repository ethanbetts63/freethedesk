"""What goes in which box on each published version of each prescribed form.

Keyed by ``(kind, version_label)``, and kept in code rather than in the
database. A reissue that renames a field is a code change however it arrives,
and a field map somebody can edit through a form is a way to fix a silently
wrong document by typing, which is the failure this arrangement exists to stop.

Generation asserts a map exists for the pinned version and **refuses** when it
does not. Without that assertion the failure mode is a form that prints with
empty boxes — which looks like a customer who did not fill something in, and
gets discovered at a Department counter. With it, the failure is loud, immediate,
and names the version.

**Signature and declaration-date fields are deliberately left blank here.** These
are statutory declarations. Prefilling saves the customer copying details out;
signing on their behalf would forge the one act the declaration is about.
Signatures are applied only by the signing step, and only after a declaration.
"""

from pypdf.generic import NameObject

#: The revision each form prints on itself, from
#: `_docs/licensing/wa_dealer_forms/README.md`.
VL17_VERSION = "2026-04-29"
MR9B_VERSION = "2026-05-21"

#: Neither form has a box for a moped, and DoT's own body-type vocabulary does
#: not carry one. Both classes are motor cycles for licensing purposes.
BODY_TYPE = "MOTOR CYCLE"


class MissingFieldMap(RuntimeError):
    """A prescribed form is pinned to a version this build cannot fill."""


def _split_date(value):
    """``('05', '11', '1990')`` for the day/month/year triplets these forms use."""
    if not value:
        return "", "", ""
    return f"{value.day:02d}", f"{value.month:02d}", str(value.year)


def _form_amount(value):
    """``'4850.00'`` — no symbol, no separators. These go in form boxes.

    Named apart from the contract's own money formatter, which produces
    ``'$4,850.00'``. Two functions called ``_money`` in neighbouring modules,
    giving different output, is a mistake waiting for whoever imports the wrong
    one.
    """
    return f"{value:.2f}" if value is not None else ""


def postal_address(sale):
    """Where the Department sends the papers.

    The delivery address when there is one, because that is where the customer
    is having the vehicle sent and is the same place they expect the paperwork.
    They are one address, not two, and carrying them separately invites them to
    disagree on a form the customer signs a declaration about.

    Falls back to the licensee's address for a collection, where there is no
    delivery address to use.
    """
    if sale.requires_delivery and sale.delivery_address_line1:
        return (
            sale.delivery_address_line1,
            sale.delivery_suburb,
            sale.delivery_state or "WA",
            sale.delivery_postcode,
        )
    return (
        sale.licensee_address_line1,
        sale.licensee_suburb,
        "WA",
        sale.licensee_postcode,
    )


def _vl17(sale, dealer, profile):
    dob_day, dob_month, dob_year = _split_date(sale.licence_date_of_birth)
    officer_day, officer_month, officer_year = _split_date(
        profile.authorised_officer_date_of_birth
    )
    postal_line, postal_suburb, postal_state, postal_postcode = postal_address(sale)
    # The dutiable value is what the vehicle is worth, which is the RRP where a
    # dealer has recorded one and the price otherwise. Understating it carries
    # penalties up to $20,000 — see the forms README — so the fallback is the
    # price rather than a blank.
    dutiable = sale.rrp if sale.rrp is not None else sale.vehicle_price

    return {
        "FAMILY NAME4": sale.licence_family_name,
        "OTHER NAMES5": sale.licence_given_names,
        "DRIVERS LICENCE NUMBER6": sale.licence_number,
        "BIRTH DATE DAY1": dob_day,
        "BIRTH DATE MONTH2": dob_month,
        "BIRTH DATE YEAR3": dob_year,
        "PHONE NUMBER1": sale.customer_phone,
        "RESIDENTIAL ADDRESS_2": sale.licensee_address_line1,
        "SUBURB3": sale.licensee_suburb,
        "POST CODE": sale.licensee_postcode,
        "POSTAL ADDRESS": postal_line,
        "SUBURB_2": postal_suburb,
        "STATE": postal_state,
        "POST CODE_2": postal_postcode,

        "ORGANISATION/COMPANY IF APPLICABLE1": (
            sale.company_name if sale.licensed_to_company else ""
        ),
        "AUSTRALIAN COMPANY NUMBER ACN2": (
            sale.company_acn if sale.licensed_to_company else ""
        ),
        "ORGANISATION CODE3": (
            sale.company_organisation_code if sale.licensed_to_company else ""
        ),

        "CHECK2": NameObject("/1" if sale.kept_primarily_in_wa else "/2"),
        # VL17's lower option is "Vehicle to be licensed in new name". This form
        # is only produced for stock being licensed for the first time, never a
        # relisting in the same holder's name.
        "Check Box1": NameObject("/2"),

        "CURRENT OR PREVIOUS PLATE NUMBER1": "NEW",
        "MAKE": sale.make,
        "MODEL": sale.model_name,
        "BODY TYPE": BODY_TYPE,
        "YEAR OF MANUFACTURE": str(sale.year or ""),
        "VIN CHASSIS NUMBER IF KNOWN": sale.vin,
        "PURCHASE PRICE": _form_amount(sale.vehicle_price),
        "DUTIABLE VALUE": _form_amount(dutiable),

        "SELLER FULL NAME": profile.authorised_officer_name,
        "DRIVERS LICENCE NUMBER7": profile.authorised_officer_licence_number,
        "BIRTH DATE DAY2": officer_day,
        "BIRTH DATE MONTH3": officer_month,
        "BIRTH DATE YEAR4": officer_year,
        "REPRESENTING ORGANISATION/COMPANY IF APPLICABLE": dealer.business_name,
        "AUSTRALIAN COMPANY NUMBER ACN_2": profile.acn,
        "NAME OF ORGANISATION1": dealer.business_name,
        "ORGANISATION CODE_2": profile.organisation_code,
        "ADDRESS": profile.address_line1,
        "SUBURB_3": profile.suburb,
        "STATE 2": dealer.state,
        "POST CODE_3": profile.postcode,
        "NAME OF PURCHASER": sale.customer_name,
        "Purchase1": _form_amount(sale.vehicle_price),
        "dutiable1": _form_amount(dutiable),
        "DECLARED AT_2": profile.declared_at,
    }


def _mr9b(sale, dealer, profile):
    dob_day, dob_month, dob_year = _split_date(sale.licence_date_of_birth)
    postal_line, postal_suburb, _state, postal_postcode = postal_address(sale)

    return {
        "PLATE NUMBER": sale.registration,
        "YEAR OF MANUFACTURE": str(sale.year or ""),
        "MAKE": sale.make,
        "MODEL": sale.model_name,
        "BODY TYPE": BODY_TYPE,
        "ENGINE NUMBER": sale.engine_number,
        "CHASSISVIN NUMBER": sale.vin,
        "ODOMETER READING": str(sale.odometer_km or ""),

        "ORGANISATION CODEPREMISES NUMBER": profile.organisation_code,
        "ADDRESS1": profile.address_line1,
        "POSTCODE": profile.postcode,
        "DEALER'S LICENCE NUMBER1": profile.dealer_licence_number,
        "STOCK REGISTER NUMBER": sale.stock_number,
        "DUTIABLE VALUE": _form_amount(sale.vehicle_price),
        "SELLING PRICE1": _form_amount(sale.vehicle_price),

        "PURCHASERS FULL NAME FAMILY NAME": sale.licence_family_name,
        "GIVEN NAMES": sale.licence_given_names,
        "DRIVERS LICENCE NUMBER": sale.licence_number,
        "CONTACT PHONE NUMBER1": sale.customer_phone,
        "DAY3": dob_day,
        "MONTH3": dob_month,
        "YEAR3": dob_year,
        "Check Box 3": NameObject("/1" if sale.licensed_to_company else "/2"),
        "ORGANISATION CODE IF APPLICABLE": (
            sale.company_organisation_code if sale.licensed_to_company else ""
        ),
        "COMPANY NAME1": sale.company_name if sale.licensed_to_company else "",
        "AUSTRALIAN COMPANY NUMBER ACN": sale.company_acn if sale.licensed_to_company else "",
        "RESIDENTIAL ADDRESS1": sale.licensee_address_line1,
        "SUBURB1": sale.licensee_suburb,
        "POSTCODE_2": sale.licensee_postcode,
        # The garaging address is where the vehicle lives, which is the licence
        # holder's address rather than wherever the papers are sent.
        "GARAGING ADDRESS": sale.licensee_address_line1,
        "SUBURB2": sale.licensee_suburb,
        "POSTCODE_3": sale.licensee_postcode,
        "POSTAL ADDRESS1": postal_line,
        "SUBURB_3": postal_suburb,
        "POSTCODE_4": postal_postcode,
    }


FIELD_MAPS = {
    ("vl17", VL17_VERSION): _vl17,
    ("mr9b", MR9B_VERSION): _mr9b,
}


def values_for(kind, version_label, sale, dealer, profile) -> dict:
    """The values to write into one version of one form.

    Refuses rather than filling what it recognises. A partially understood form
    produces a document that looks complete and is not, and the person who finds
    out is standing at a counter.
    """
    builder = FIELD_MAPS.get((kind, version_label))
    if builder is None:
        known = ", ".join(sorted(version for k, version in FIELD_MAPS if k == kind)) or "none"
        raise MissingFieldMap(
            f"No field map for {kind} version {version_label!r}. Known versions: "
            f"{known}. A reissued form needs its map added in documents/field_maps.py "
            "before it can be filled."
        )
    return builder(sale, dealer, profile)
