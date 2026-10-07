import type { Metadata } from 'next';

import { AUTHOR } from './author';
import {
  DEFAULT_OG_HEIGHT,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_WIDTH,
  SITE_NAME,
  SITE_URL,
} from './siteConfig';
import {
  absoluteUrl,
  buildBreadcrumbSchema,
  buildWebPageSchema,
  buildWebsiteSchema,
} from '@/lib/schema';

const CONTACT_EMAIL = 'hello@freethedesk.com.au';

/** The same number as the Business Profile, so the two agree. */
const CONTACT_PHONE = '+61 423 853 830';

/** Our ABN, published as `taxID` and used to build the ABR lookup URL below. */
const ABN = '11493753896';

/**
 * The single business entity every other node points at via `@id`.
 *
 * Typed `ProfessionalService` (a LocalBusiness subtype) rather than a bare
 * Organization so the Perth address carries local weight. `areaServed` is
 * Western Australia: the service pages narrow it to Perth, and a national area
 * told Google this was a company with no home. Only verifiable facts belong
 * here - no opening hours until there are real ones to publish.
 */
export function buildOrganizationSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    email: CONTACT_EMAIL,
    telephone: CONTACT_PHONE,
    /*
     * One entity-level sentence: what this company is, not what any page sells.
     * Web development and automation lead because that is the business; the
     * dealership work is one line of it, not the headline.
     */
    description:
      'Perth web development, SEO and digital automation company, building custom websites, SEO and workflow automation for businesses in Perth and across Australia — including dealership websites and online vehicle licensing.',
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo-512x512.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE_URL}/logo-512x512.png`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dianella',
      addressRegion: 'WA',
      postalCode: '6059',
      addressCountry: 'AU',
    },
    /*
     * `taxID` rather than a custom `identifier` PropertyValue: Google's
     * Organization documentation lists taxID among the properties it reads,
     * and lists no `identifier`. Same fact, in the spelling that is actually
     * consumed. (Verified against Google's Organization structured data page,
     * 2026-09-17.)
     */
    taxID: ABN,
    /*
     * The one external page that identifies this company. The ABR record for
     * the ABN above registers "freethedesk" as a business name, so it
     * corroborates the `name` on this node from a source that is not us — which
     * is the entire job of `sameAs`, and something this site previously had
     * none of. Social profiles belong here too, once there are live ones.
     */
    sameAs: [`https://abr.business.gov.au/ABN/View?id=${ABN}`],
    areaServed: { '@type': 'State', name: 'Western Australia' },
    /*
     * Spelled identically to the Person node on the other sites, and carrying
     * the same profile URL — one profile is what ties three sites' references
     * to one person rather than three similarly-named ones. The middle name
     * lives in `additionalName` so it is available to a machine without
     * appearing in any visible byline. Sourced from the shared `AUTHOR` record
     * so this and the Article `author` node below can't drift apart.
     */
    founder: {
      '@type': 'Person',
      name: AUTHOR.name,
      givenName: AUTHOR.givenName,
      additionalName: AUTHOR.additionalName,
      familyName: AUTHOR.familyName,
      url: AUTHOR.profileUrl,
    },
  };
}

export interface ServiceDefinition {
  name: string;
  serviceType: string;
  areaServed: { type: 'Country' | 'City'; name: string };

  /** Optional catalogue of individually named offers under this service. */
  catalog?: { name: string; itemListElement: { name: string; description?: string }[] };
}

/**
 * A subscription price as Google reads it: price, currency, availability and
 * the billing period. Missing any of the first three, no price shows in
 * results. Returns undefined for a blank admin price rather than offering
 * something for nothing.
 */
export function buildRecurringOffer(options: {
  price: string;
  unitText: 'MONTH' | 'QUARTER';
  name?: string;
}): object | undefined {
  if (!options.price.trim()) return undefined;
  return {
    '@type': 'Offer',
    ...(options.name ? { name: options.name } : {}),
    price: options.price,
    priceCurrency: 'AUD',
    availability: 'https://schema.org/InStock',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: options.price,
      priceCurrency: 'AUD',
      unitText: options.unitText,
    },
  };
}

/**
 * The commercial node for a page that sells something.
 *
 * Addressable (`@id`) and anchored (`url`, `mainEntityOfPage`) so it is a real
 * member of the graph rather than a floating island — the two pages that
 * previously built this inline had neither, which left a `Service` Google could
 * read but not attach to the page or the business offering it.
 *
 * `offers` is passed in rather than declared in the registry because the
 * priced pages read their prices from the admin at request time. A
 * service with no offer node is still valid and still useful; an invented price
 * is not.
 */
export function buildServiceSchema(options: {
  service: ServiceDefinition;
  path: string;
  description?: string;
  offers?: object;
}): object {
  const url = `${SITE_URL}${options.path}`;
  const { service } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name: service.name,
    serviceType: service.serviceType,
    url,
    ...(options.description ? { description: options.description } : {}),
    areaServed: { '@type': service.areaServed.type, name: service.areaServed.name },
    provider: { '@id': `${SITE_URL}/#organization` },
    mainEntityOfPage: { '@id': `${url}#webpage` },
    ...(options.offers ? { offers: options.offers } : {}),
    ...(service.catalog
      ? {
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: service.catalog.name,
            itemListElement: service.catalog.itemListElement.map((item) => ({
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: item.name,
                ...(item.description ? { description: item.description } : {}),
              },
            })),
          },
        }
      : {}),
  };
}

/** Breadcrumb items from Home to `path`, inferred from the segments; `label` names the last crumb. */
export function buildBreadcrumbItems(
  path: string,
  label: string,
): { name: string; path: string }[] {
  if (path === '/') return [{ name: 'Home', path: '/' }];

  const segments = path.split('/').filter(Boolean);
  const crumbs = [{ name: 'Home', path: '/' }];

  segments.forEach((segment, index) => {
    const segmentPath = `/${segments.slice(0, index + 1).join('/')}`;
    const isLast = index === segments.length - 1;
    crumbs.push({ name: isLast ? label : titleCaseSlug(segment), path: segmentPath });
  });

  return crumbs;
}

function titleCaseSlug(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/**
 * Builds a page's <head> metadata (canonical, Open Graph, Twitter Card) from a
 * single title/description/path so the three can't drift apart.
 *
 * Set `absoluteTitle: true` when a title must remain immune to any title
 * templates introduced by a parent layout in the future.
 */
export function buildMetadata(options: {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  absoluteTitle?: boolean;
  openGraphType?: 'website' | 'article';
  noindex?: boolean;
}): Metadata {
  const url = absoluteUrl(options.path);
  const imageUrl = absoluteUrl(options.ogImage ?? DEFAULT_OG_IMAGE);

  // Only the default asset carries width and height. A page-supplied image is
  // a photograph whose dimensions this function does not know, and stating
  // them wrongly is worse than omitting them. Matches allbikes and bloomprint.
  const ogImage = options.ogImage
    ? { url: imageUrl }
    : { url: imageUrl, width: DEFAULT_OG_WIDTH, height: DEFAULT_OG_HEIGHT };

  return {
    title: options.absoluteTitle ? { absolute: options.title } : options.title,
    description: options.description,
    alternates: { canonical: url },
    openGraph: {
      title: options.title,
      description: options.description,
      type: options.openGraphType ?? 'website',
      url,
      siteName: SITE_NAME,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: options.title,
      description: options.description,
      images: [imageUrl],
    },
    robots: options.noindex ? { index: false, follow: false } : undefined,
  };
}

/**
 * `author` is built from the shared `AUTHOR` record rather than from the
 * article's own `authorName` — there is exactly one writer, and a bare
 * `{ name }` here is precisely how the same person ends up spelled two ways
 * across two sites. Matches the shape allbikes emits for the same person.
 */
export function buildArticleSchema(article: {
  slug: string;
  title: string;
  excerpt: string;
  publishedDate: string;
  lastModified: string;
}): object {
  const url = `${SITE_URL}/${article.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: article.title,
    description: article.excerpt,
    url,
    mainEntityOfPage: { '@id': `${url}#webpage` },
    author: {
      '@type': 'Person',
      '@id': `${SITE_URL}/#author`,
      name: AUTHOR.name,
      givenName: AUTHOR.givenName,
      additionalName: AUTHOR.additionalName,
      familyName: AUTHOR.familyName,
      url: AUTHOR.profileUrl,
    },
    publisher: { '@id': `${SITE_URL}/#organization` },
    datePublished: article.publishedDate,
    dateModified: article.lastModified,
  };
}

/**
 * The sitewide nodes come from `lib/schema`, which all three sites share.
 * Re-exported here so every caller that already reads them from `lib/seo`
 * keeps one import.
 */
export { absoluteUrl, buildBreadcrumbSchema, buildWebPageSchema, buildWebsiteSchema };
