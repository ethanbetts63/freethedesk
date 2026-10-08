"""What each package costs, and how much of it is paid upfront, read from the admin's settings.

The order form quotes from here when an order is made, and checkout quotes again before charging:
if the two disagree, the price changed in between and the customer is sent back to agree to the
new one. The frontend's ``lib/servicePricing.ts`` shows the same figures.
"""

from dataclasses import dataclass
from decimal import Decimal

from ..models import PackageOrder, SiteSettings


@dataclass(frozen=True)
class PackageQuote:
    package: str
    name: str
    price: Decimal
    #: Half of a website, all of discovery: the web development terms' payment split.
    due_now: Decimal
    #: The sum behind the price, for staff: "10 pages at $600 a page".
    basis: str
    currency: str = "aud"

    @property
    def is_deposit(self) -> bool:
        return self.due_now < self.price


def dollars(amount: Decimal) -> str:
    """$3,000 or $3,000.50: whole dollars when there are no cents."""
    return f"${amount:,.0f}" if amount == amount.to_integral_value() else f"${amount:,.2f}"


_DISCOVERY = {
    PackageOrder.Package.WEB_APPLICATION: "Web application discovery",
    PackageOrder.Package.AUTOMATION_DISCOVERY: "Automation discovery",
}


def quote_package(package: str, settings: SiteSettings | None = None) -> PackageQuote:
    settings = settings or SiteSettings.load()
    if package in _DISCOVERY:
        hours = settings.discovery_hours
        price = settings.hourly_rate * hours
        return PackageQuote(
            package=package,
            name=_DISCOVERY[package],
            price=price,
            due_now=price,
            basis=f"{hours} hours at {dollars(settings.hourly_rate)} an hour",
        )
    if package == PackageOrder.Package.WEBSITE_SMALL:
        pages, page_price = settings.website_small_pages, settings.website_small_page_price
    elif package == PackageOrder.Package.WEBSITE_LARGE:
        pages, page_price = settings.website_large_pages, settings.website_large_page_price
    else:
        raise ValueError(f"Unknown package {package!r}.")
    price = page_price * pages
    return PackageQuote(
        package=package,
        name=f"{pages}-page website",
        price=price,
        due_now=(price / 2).quantize(Decimal("0.01")),
        basis=f"{pages} pages at {dollars(page_price)} a page",
    )
