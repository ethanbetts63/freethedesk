import type { PublicSiteSettings } from './api';
import { formatMoney } from './formatting';

/**
 * The prices pages quote, worked out once so every page that states one agrees.
 *
 * A website is one of three packages at a fixed price, agreed on a call (owner, 2026-11-21).
 * What is bought online is discovery: so many hours at the admin's hourly rate, paid in full,
 * with the build then priced to the customer's budget.
 *
 * `purchasePackages` also holds the websites once bought online, priced per page from the
 * admin's counts and prices and paid half when bought, half before launch. No page sells them
 * now; the payment page still reads them for an order already placed. The codes match the
 * backend's PackageOrderSerializer.PACKAGES, which works out the same split.
 */

export type WebsitePackageCode = 'basic' | 'growth' | 'complete';

/** The three website packages' prices, typed here until they move to the admin (see _docs/to_do.md). */
export const WEBSITE_PACKAGE_PRICES: Record<WebsitePackageCode, number> = {
  basic: 1500,
  growth: 3000,
  complete: 4500,
};

export type PackageCode =
  | 'website_one_page'
  | 'website_small'
  | 'website_large'
  | 'web_application'
  | 'automation_discovery';

export interface PurchasePackage {
  code: PackageCode;
  name: string;
  /** The package's full price. */
  price: number;
  /** What the customer pays when they buy: half of a website, all of discovery. */
  dueNow: number;
  /** The sum behind the price, so "per page" or "per hour" is visible rather than claimed. */
  priceNote: string;
  includes: readonly string[];
  /** The package the order form opens on. */
  recommended?: boolean;
  /** The price buys discovery, not the build: the card, the button and the schema offer say so. */
  discovery?: true;
}

/** What the customer is buying, in the schema offer and anywhere else the card isn't beside it. */
export function offerName(item: PurchasePackage): string {
  return item.discovery ? `${item.name} discovery` : item.name;
}

/** Display money: whole dollars when there are no cents. */
export function money(value: string | number): string {
  return formatMoney(value, { cents: 'auto' });
}

export function purchasePackages(settings: PublicSiteSettings): PurchasePackage[] {
  const onePagePrice = Number(settings.website_one_page_price);
  const smallPages = settings.website_small_pages;
  const smallPagePrice = Number(settings.website_small_page_price);
  const largePages = settings.website_large_pages;
  const largePagePrice = Number(settings.website_large_page_price);
  const hourly = Number(settings.hourly_rate);
  const hours = settings.discovery_hours;

  return [
    {
      code: 'website_one_page',
      name: 'One-page website',
      price: onePagePrice,
      dueNow: onePagePrice / 2,
      priceNote: 'A single page',
      includes: [
        'One custom, mobile-first page',
        'Enquiry form to your inbox',
        'SEO foundations built in',
        'Search Console and Analytics set up',
      ],
    },
    {
      code: 'website_small',
      name: `${smallPages}-page website`,
      price: smallPages * smallPagePrice,
      dueNow: (smallPages * smallPagePrice) / 2,
      priceNote: `${smallPages} pages at ${money(smallPagePrice)} a page`,
      includes: [
        'Custom, mobile-first design',
        'Enquiry form to your inbox',
        'SEO foundations built in',
        'Search Console and Analytics set up',
      ],
    },
    {
      code: 'website_large',
      name: `${largePages}-page website`,
      price: largePages * largePagePrice,
      dueNow: (largePages * largePagePrice) / 2,
      priceNote: `${largePages} pages at ${money(largePagePrice)} a page`,
      includes: [
        `Everything in the ${smallPages}-page website`,
        'Pages planned from keyword research',
        'Google Business Profile review',
        'An SEO audit at three months',
      ],
      recommended: true,
    },
    {
      code: 'web_application',
      name: 'Web application',
      price: hourly * hours,
      dueNow: hourly * hours,
      priceNote: `${hours} hours at ${money(hourly)} an hour`,
      includes: [
        'Your process and tools mapped',
        'A written scope for the build',
        'The build priced to your budget',
      ],
      discovery: true,
    },
  ];
}

/**
 * The automation page's one package: discovery, bought like the web application
 * package and priced the same way, from the hourly rate.
 */
export function automationDiscovery(settings: PublicSiteSettings): PurchasePackage {
  const hourly = Number(settings.hourly_rate);
  const hours = settings.discovery_hours;
  return {
    code: 'automation_discovery',
    name: 'Automation',
    price: hourly * hours,
    dueNow: hourly * hours,
    priceNote: `${hours} hours at ${money(hourly)} an hour`,
    includes: [
      'Your repetitive work mapped',
      'A written scope for the build',
      'The build priced to your budget',
    ],
    discovery: true,
  };
}

/** The figures most pages quote, already formatted. */
export function servicePrices(settings: PublicSiteSettings) {
  const hourly = Number(settings.hourly_rate);
  const seoFrom = Math.min(
    ...[settings.seo_essentials_price, settings.seo_plus_price, settings.seo_complete_price].map(
      Number,
    ),
  );

  return {
    hourlyRate: money(hourly),
    discoveryHours: settings.discovery_hours,
    discoveryTotal: money(hourly * settings.discovery_hours),
    websiteFrom: money(Math.min(...Object.values(WEBSITE_PACKAGE_PRICES))),
    seoFrom: money(seoFrom),
  };
}

export type ServicePrices = ReturnType<typeof servicePrices>;
