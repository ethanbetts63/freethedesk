import type { PublicSiteSettings } from './api';
import { formatMoney } from './formatting';

/**
 * The website development packages and the quoted services' prices, worked out
 * once from the admin's settings so every page that states one agrees.
 *
 * Packages 1 and 2 are websites priced per page: a page count at a per-page
 * price. Package 3 is a web application, bought as its discovery: that many
 * hours at the hourly rate, paid upfront. What each package includes is copy
 * and lives here; the counts and prices belong to the admin. The codes match
 * the backend's PackageOrderSerializer.PACKAGES.
 */

export type PackageCode = 'website_small' | 'website_large' | 'web_application';

export interface PurchasePackage {
  code: PackageCode;
  /** "Package 1": the position, shown above the name. */
  label: string;
  name: string;
  summary: string;
  /** What the customer pays when they buy. */
  price: number;
  /** The sum behind the price, so "per page" or "per hour" is visible rather than claimed. */
  priceNote: string;
  includesHeading: string;
  includes: readonly string[];
  recommended?: boolean;
}

/** Display money: whole dollars when there are no cents. */
export function money(value: string | number): string {
  return formatMoney(value, { cents: 'auto' });
}

export function purchasePackages(settings: PublicSiteSettings): PurchasePackage[] {
  const smallPages = settings.website_small_pages;
  const smallPagePrice = Number(settings.website_small_page_price);
  const largePages = settings.website_large_pages;
  const largePagePrice = Number(settings.website_large_page_price);
  const hourly = Number(settings.hourly_rate);
  const hours = settings.discovery_hours;
  const smallName = `${smallPages}-page website`;

  return [
    {
      code: 'website_small',
      label: 'Package 1',
      name: smallName,
      summary: 'A site that gets found and turns visits into enquiries.',
      price: smallPages * smallPagePrice,
      priceNote: `${smallPages} pages at ${money(smallPagePrice)} a page`,
      includesHeading: 'Includes',
      includes: [
        'Custom design, planned mobile-first',
        'An enquiry form that lands in your inbox',
        'SEO foundations: titles, descriptions, structured data and a sitemap',
        'Search Console and Google Analytics set up from day one',
      ],
    },
    {
      code: 'website_large',
      label: 'Package 2',
      name: `${largePages}-page website`,
      summary: 'More pages, each built to rank for something your customers search.',
      price: largePages * largePagePrice,
      priceNote: `${largePages} pages at ${money(largePagePrice)} a page`,
      includesHeading: `Everything in the ${smallName}, plus`,
      includes: [
        'Service and suburb pages planned from keyword research',
        'Your Google Business Profile set up or tidied to match',
        'An SEO audit three months after launch, ranked by what each fix is worth',
      ],
      recommended: true,
    },
    {
      code: 'web_application',
      label: 'Package 3',
      name: 'Web application',
      summary: 'Portals, bookings, payments and the staff dashboards behind them.',
      price: hourly * hours,
      priceNote: `${hours} hours of discovery at ${money(hourly)} an hour`,
      includesHeading: 'What you buy today',
      includes: [
        'Discovery: we map your process, your tools and what to build first',
        'A written scope and a price for the first release',
        `Projects from ${money(settings.web_app_from_price)}, built in stages you sign off`,
      ],
    },
  ];
}

/** The figures most pages quote, already formatted. */
export function servicePrices(settings: PublicSiteSettings) {
  const packages = purchasePackages(settings);
  const hourly = Number(settings.hourly_rate);
  const seoFrom = Math.min(
    ...[
      settings.seo_monthly_price,
      settings.seo_quarterly_price,
      settings.seo_yearly_price,
      settings.seo_oneoff_price,
    ].map(Number),
  );
  const websites = packages.filter((item) => item.code !== 'web_application');

  return {
    packages,
    hourlyRate: money(hourly),
    discoveryHours: settings.discovery_hours,
    discoveryTotal: money(hourly * settings.discovery_hours),
    websiteFrom: money(Math.min(...websites.map((item) => item.price))),
    pagePriceFrom: money(
      Math.min(
        Number(settings.website_small_page_price),
        Number(settings.website_large_page_price),
      ),
    ),
    webAppFrom: money(settings.web_app_from_price),
    automationFrom: money(settings.automation_from_price),
    seoFrom: money(seoFrom),
    licensingFrom: money(
      Math.min(
        ...[settings.licensing_price, settings.contracts_price, settings.complete_price].map(
          Number,
        ),
      ),
    ),
  };
}

export type ServicePrices = ReturnType<typeof servicePrices>;
