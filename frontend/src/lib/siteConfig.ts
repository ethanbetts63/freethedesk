// Default to the canonical host. The apex 308-redirects to www, so an apex
// default would silently publish redirecting URLs in canonicals, @ids, OG
// tags and the sitemap wherever NEXT_PUBLIC_SITE_URL is unset.
//
// This file is a leaf on purpose: no imports, so `robots.txt` and `sitemap.ts`
// can take the origin without dragging `lib/seo` into a statically-rendered
// route's module graph.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.freethedesk.com.au'
).replace(/\/$/, '');

export const PORTFOLIO_NAVIGATION = [
  { href: '/portfolio/scooter-shop', label: 'Scooter Shop' },
  { href: '/portfolio/bloomprint', label: 'Bloomprint' },
] as const;

/*
 * Services lead; the dealership products share one item. Dealers are one line of
 * the business, not half the menu.
 */
export const PRIMARY_NAVIGATION = [
  { href: '/website-development', label: 'Websites' },
  { href: '/automation', label: 'Automation' },
  { href: '/seo', label: 'SEO' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/dealers', label: 'Dealerships' },
  { href: '/contact', label: 'Contact' },
] as const;

export const FOOTER_NAVIGATION = [
  { href: '/website-development', label: 'Website development' },
  { href: '/automation', label: 'Automation' },
  { href: '/seo', label: 'SEO audits' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/guides', label: 'Guides & articles' },
  { href: '/contact', label: 'Contact' },
  { href: '/login', label: 'Login' },
] as const;

export const DEALER_NAVIGATION = [
  { href: '/dealers', label: 'Dealer websites' },
  { href: '/licensing', label: 'Online licensing' },
] as const;

/**
 * The zone every timestamp is read in. A DRF `DateTimeField` arrives as UTC,
 * so without this a sale recorded at 8am reads as the previous evening. Date-
 * only values are calendar dates and deliberately skip it — see
 * `lib/formatting`.
 */
export const SITE_TIMEZONE = 'Australia/Perth';

/**
 * The site's name as it appears in `siteName`, in a `WebSite` node, and
 * anywhere a schema node has to say whose site this is.
 */
export const SITE_NAME = 'freethedesk';

/**
 * The one fallback link-preview image, and its real dimensions.
 *
 * Only the default asset carries width and height: a page-supplied image is a
 * photograph whose size the metadata builder does not know, and stating it
 * wrongly is worse than omitting it.
 */
export const DEFAULT_OG_IMAGE = '/og-images/og-default.webp';
export const DEFAULT_OG_WIDTH = 1200;
export const DEFAULT_OG_HEIGHT = 630;
