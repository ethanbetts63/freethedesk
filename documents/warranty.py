"""The reg 7 warranty test, and the notice it selects.

Motor Vehicle Dealers (Sales) Regulations 1974 (WA) reg 7. Three conditions,
all of which must hold; pass and the vehicle carries the statutory warranty and
the purchaser is given Form 5A, fail any and they are given Form 6.

|                      | Motorcycle | Car (later) |
| -------------------- | ---------- | ----------- |
| Cash price incl. GST | >= $3,500  | >= $4,000   |
| Age                  | <= 8 years | <= 12 years |
| Odometer             | <= 80,000  | <= 180,000  |

**Given before the sale.** Reg 7 says so twice, once for each form, which is
why this is its own gate ahead of signing rather than a page in the pack.

Applying a bright-line statutory test with no discretion in it is automation,
not legal practice — the same way payroll software applying award rates is not.
That distinction is what keeps this on the right side of the line drawn in
`_docs/licensing/research/findings-2026-08-30.md` section 6. There is nothing to
weigh here: three numbers decide it.

New stock gets neither form. The manufacturer's warranty information is shown
instead, which is product copy rather than a prescribed form.
"""

import hashlib
import json
from dataclasses import dataclass
from django.utils import timezone
from decimal import Decimal

from documents.models import FormTemplate


@dataclass(frozen=True)
class Thresholds:
    max_price: Decimal
    max_age_years: int
    max_odometer_km: int


#: Keyed by ``Sale.VehicleClass``. A moped takes the motorcycle thresholds
#: because reg 7 draws its line between motor cycles and other vehicles and a
#: moped is on the motor cycle side of it.
#:
#: Carried as a table from day one even though v1 sells only these two, because
#: cars tier again inside the outer limits and discovering that after the fact
#: means a migration plus a backfill plus a default that is wrong for whatever
#: came first.
THRESHOLDS = {
    "motorcycle": Thresholds(Decimal("3500"), 8, 80_000),
    "moped": Thresholds(Decimal("3500"), 8, 80_000),
}


class WarrantyNoticeUnavailable(RuntimeError):
    """The form this sale needs has no current template uploaded."""


def vehicle_age_years(year, today=None) -> int | None:
    """Age in whole years, counted from the year of manufacture.

    Year arithmetic rather than a date difference, because a year of
    manufacture is all that is ever recorded — a vehicle has no build day on any
    of the paperwork this reads. Counting from the year is therefore the only
    computation the available data supports, and it is the one a dealer would
    do.

    ``timezone.localdate()`` rather than ``date.today()``: the host runs in UTC
    and ``TIME_ZONE`` is Perth, so for eight hours of every day they are
    different dates — and across New Year that is a different *year*, which is
    a different answer to the eight-year limb of reg 7.

    Perth is a stand-in for the dealer's own timezone, which is what this should
    read once FreeTheDesk sells outside WA. See
    `_docs/licensing/open-questions.md`.
    """
    if not year:
        return None
    return (today or timezone.localdate()).year - year


def statutory_warranty_applies(sale, today=None) -> bool:
    """All three conditions of reg 7, for used stock.

    A missing figure fails the test rather than passing it. The consequence of
    getting this wrong in each direction is not symmetrical: telling a customer
    a statutory warranty applies when it does not is a representation about
    their rights, and telling them it does not when it might is an understatement
    they can and will check against the form they are given.
    """
    thresholds = THRESHOLDS.get(sale.vehicle_class)
    if thresholds is None:
        return False
    if sale.vehicle_price is None or sale.odometer_km is None:
        return False
    age = vehicle_age_years(sale.year, today=today)
    if age is None:
        return False
    return (
        sale.vehicle_price >= thresholds.max_price
        and age <= thresholds.max_age_years
        and sale.odometer_km <= thresholds.max_odometer_km
    )


def notice_kind_for(sale, today=None) -> str | None:
    """Which prescribed form this sale's warranty notice is, or ``None``.

    ``None`` is new stock, which gets the manufacturer's information instead.
    """
    if not sale.is_used_stock:
        return None
    if statutory_warranty_applies(sale, today=today):
        return FormTemplate.Kind.FORM_5A_MOTORCYCLE
    return FormTemplate.Kind.FORM_6


def acknowledgement_key(sale, today=None) -> str:
    """A fingerprint of everything the notice depends on.

    Comparing this against the stored key is what makes an acknowledgement stop
    counting when its inputs move, with no flag anyone has to remember to clear.
    The failure it prevents is a customer who acknowledged that a statutory
    warranty applied and then bought a vehicle where it does not.

    The form kind is in the fingerprint as well as its inputs. Belt and braces
    that costs nothing, and it means a change to the thresholds themselves — a
    regulation amendment — also invalidates every outstanding acknowledgement,
    which is the correct outcome and is not otherwise achieved.
    """
    payload = {
        "kind": notice_kind_for(sale, today=today) or "manufacturer",
        "vehicle_class": sale.vehicle_class,
        "condition": sale.condition,
        "vehicle_price": str(sale.vehicle_price) if sale.vehicle_price is not None else None,
        "year": sale.year,
        "odometer_km": sale.odometer_km,
    }
    return hashlib.sha256(
        json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
    ).hexdigest()


def warranty_notice(sale, today=None) -> dict:
    """Everything a screen needs to present the notice and record its answer."""
    kind = notice_kind_for(sale, today=today)
    key = acknowledgement_key(sale, today=today)
    if kind is None:
        title = "Manufacturer's warranty"
        summary = (
            "This vehicle is new, so it is not covered by the Western Australian "
            "statutory used-vehicle warranty. It carries the manufacturer's own "
            "warranty, which the dealer will give you the details of."
        )
    elif kind == FormTemplate.Kind.FORM_5A_MOTORCYCLE:
        title = "Statutory warranty — Form 5A"
        summary = (
            "This used vehicle is covered by the Western Australian statutory "
            "warranty. Read Form 5A in full before you sign anything."
        )
    else:
        title = "No statutory warranty — Form 6"
        summary = (
            "This used vehicle is not covered by the Western Australian statutory "
            "warranty. Read Form 6 in full before you sign anything."
        )

    return {
        "kind": kind or "manufacturer",
        "title": title,
        "summary": summary,
        "acknowledgement_key": key,
        "acknowledged": bool(sale.warranty_acknowledgement_key)
        and sale.warranty_acknowledgement_key == key,
        "acknowledged_at": sale.warranty_acknowledged_at
        if sale.warranty_acknowledgement_key == key
        else None,
        "statement": (
            "I have been given and have read the warranty information for this "
            "vehicle before agreeing to buy it."
        ),
    }


def notice_template(sale, today=None):
    """The published form to serve, or ``None`` for new stock.

    Raises rather than falling back when the form a sale needs has no current
    template. The statement *is* the form under reg 7 — the purchaser must be
    given an information statement in the form of Form 5A or Form 6 — so there
    is nothing to substitute and a quiet omission would leave the dealer having
    not complied without knowing it.
    """
    kind = notice_kind_for(sale, today=today)
    if kind is None:
        return None
    template = FormTemplate.current(kind)
    if template is None:
        raise WarrantyNoticeUnavailable(
            f"No current {kind} template is loaded, so this sale's warranty "
            "notice cannot be given."
        )
    return template
