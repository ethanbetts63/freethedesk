/* Component registry: freetheplatform/frontend/registry/src/lib/schema.ts
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/siteConfig';

/**
 * The sitewide schema nodes, which are the same graph on every site.
 *
 * Each site's own entity — the dealership, the florist network, the studio —
 * stays in its `lib/seo`, because what a business *is* differs. What does not
 * differ is the wiring: one Organization node, one WebSite pointing at it, one
 * WebPage per page pointing at both, and a BreadcrumbList built from the trail
 * the page already renders. Those four were written three times, and
 * `buildBreadcrumbSchema` was the same eleven lines in each.
 *
 * Every node anchors on `#organization`. allbikes used `#business`, which was
 * internally consistent and still a second name for one thing — nine `@id`
 * references in one file, all renamed.
 */

/**
 * The one spelling of a route's absolute URL, used by the canonical tag, the
 * sitemap, and every `@id`.
 *
 * The homepage is `{SITE_URL}/` — with the trailing slash — everywhere. One
 * site's sitemap used to special-case it to `{SITE_URL}` while its canonical
 * said `{SITE_URL}/`, which is two answers to one question. See
 * seo-standard.md section 4.
 */
export function absoluteUrl(pathOrUrl: string): string {
  return new URL(pathOrUrl, SITE_URL).toString();
}

/** The site itself, published by the business node. */
export function buildWebsiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

/**
 * The per-page WebPage entity, linked to the sitewide business and website
 * nodes by `@id` pointer rather than a second copy of either.
 *
 * `updated` emits `dateModified`, which is the only freshness signal a
 * marketing page has — articles carry their own dates. Bump it in the page
 * registry when a page's content materially changes; a date that never moves
 * is worse than no date. No Google rich result reads this node today; see the
 * 2026-09-17 entry in seo-standardisation.md before promising more.
 */
export function buildWebPageSchema(options: {
  title: string;
  description?: string;
  path: string;
  image?: string;
  type?: 'WebPage' | 'CollectionPage';
  updated?: string;
}): object {
  const url = absoluteUrl(options.path);

  return {
    '@context': 'https://schema.org',
    '@type': options.type ?? 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: options.title,
    ...(options.description ? { description: options.description } : {}),
    ...(options.updated ? { dateModified: options.updated } : {}),
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: absoluteUrl(options.image ?? DEFAULT_OG_IMAGE),
    },
  };
}

/**
 * The trail, as schema. Takes the same `{ name, path }[]` the visible
 * `<Breadcrumbs>` renders, so the two cannot disagree — which is the whole
 * reason a breadcrumb in a search result can be trusted to match the page.
 */
export function buildBreadcrumbSchema(items: { name: string; path: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
