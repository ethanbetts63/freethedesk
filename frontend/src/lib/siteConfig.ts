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

/*
 * Websites and SEO lead: they are the business. The dealership products share one
 * item; dealers are one line of the business, not half the menu.
 */
export const PRIMARY_NAVIGATION = [
  { href: '/website-development', label: 'Websites' },
  { href: '/seo', label: 'SEO' },
  { href: '/automation', label: 'Automation' },
  { href: '/dealers', label: 'Dealerships' },
  { href: '/contact', label: 'Contact' },
] as const;

export const FOOTER_NAVIGATION = [
  { href: '/website-development', label: 'Website development' },
  // A trial suburb page; the footer is its only link (2026-10-07).
  { href: '/web-design-subiaco', label: 'Web design Subiaco' },
  { href: '/seo', label: 'SEO audits' },
  { href: '/automation', label: 'Automation' },
  { href: '/guides', label: 'Guides & articles' },
  { href: '/contact', label: 'Contact' },
  { href: '/login', label: 'Login' },
] as const;

/**
 * When someone answers. Printed in the footer and published in the business
 * schema from this one record, and kept the same as the Business Profile's
 * hours, so a searcher reads one answer everywhere.
 */
export const OPENING_HOURS = {
  days: 'Monday to Friday',
  opens: '9 am',
  closes: '5 pm',
  schema: {
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '17:00',
  },
} as const;

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
