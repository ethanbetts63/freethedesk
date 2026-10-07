import type { PublicSiteSettings } from './api';
import { formatMoney } from './formatting';

/**
 * Prices for the services that are quoted rather than bought online, worked out
 * once from the admin's settings so every page that states one agrees.
 *
 * A website is priced per page. Each package is a page count at its own
 * per-page price, and an extra page costs the package's per-page price. What a
 * package includes is copy and lives here; how many pages and at what price
 * belongs to the admin.
 */

export type WebsitePackageCode = 'launch' | 'grow' | 'connect';

export interface WebsitePackage {
  code: WebsitePackageCode;
  name: string;
  summary: string;
  pages: number;
  pagePrice: number;
  total: number;
  /** What this package adds over the one before it. */
  adds: readonly string[];
  recommended?: boolean;
}

/** Display money: whole dollars when there are no cents. */
export function money(value: string | number): string {
  return formatMoney(value, { cents: 'auto' });
}

const PACKAGE_COPY: Record<
  WebsitePackageCode,
  Pick<WebsitePackage, 'name' | 'summary' | 'adds' | 'recommended'>
> = {
  launch: {
    name: 'Launch',
    summary: 'A site that gets found and turns visits into enquiries.',
    adds: [
      'Custom design, planned mobile-first',
      'An enquiry form that lands in your inbox',
      'SEO foundations: titles, descriptions, structured data and a sitemap',
      'Search Console and Google Analytics set up from day one',
    ],
  },
  grow: {
    name: 'Grow',
    summary: 'More pages, each built to rank for something your customers search.',
    adds: [
      'Service and suburb pages planned from keyword research',
      'Your Google Business Profile set up or tidied to match',
      'An SEO audit three months after launch, ranked by what each fix is worth',
    ],
    recommended: true,
  },
  connect: {
    name: 'Connect',
    summary: 'A site that does admin as well as marketing.',
    adds: [
      'One integration: your booking system, CRM or a supplier stock feed',
      'SMS and email alerts the moment an order, booking or enquiry arrives',
      'Routine customer emails written once and sent automatically',
    ],
  },
};

export function websitePackages(settings: PublicSiteSettings): WebsitePackage[] {
  const build = (code: WebsitePackageCode, pages: number, price: string): WebsitePackage => {
    const pagePrice = Number(price);
    return { code, ...PACKAGE_COPY[code], pages, pagePrice, total: pages * pagePrice };
  };

  return [
    build('launch', settings.website_launch_pages, settings.website_launch_page_price),
    build('grow', settings.website_grow_pages, settings.website_grow_page_price),
    build('connect', settings.website_connect_pages, settings.website_connect_page_price),
  ];
}

/** The figures most pages quote, already formatted. */
export function servicePrices(settings: PublicSiteSettings) {
  const packages = websitePackages(settings);
  const hourly = Number(settings.hourly_rate);
  const seoFrom = Math.min(
    ...[
      settings.seo_monthly_price,
      settings.seo_quarterly_price,
      settings.seo_yearly_price,
      settings.seo_oneoff_price,
    ].map(Number),
  );

  return {
    packages,
    hourlyRate: money(hourly),
    discoveryHours: settings.discovery_hours,
    discoveryTotal: money(hourly * settings.discovery_hours),
    websiteFrom: money(Math.min(...packages.map((item) => item.total))),
    pagePriceFrom: money(Math.min(...packages.map((item) => item.pagePrice))),
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
