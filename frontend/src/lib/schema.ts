/* Component registry: freetheplatform/frontend/registry/src/lib/schema.ts
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/siteConfig';

/**
 * The sitewide schema graph, the same on every site. Each site's own entity stays in its `lib/seo`.
 * Every node anchors on `#organization`.
 */

/** A route's absolute URL, for the canonical, sitemap and every `@id`; the homepage is `{SITE_URL}/`, trailing slash included (seo-standard.md section 4). */
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
 * The per-page WebPage entity, pointing at the sitewide nodes by `@id`.
 * `updated` emits `dateModified`; bump it in the page registry when content materially changes.
 * No Google rich result reads this node today (seo-standardisation.md, 2026-09-17).
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

/** The trail as schema, from the same `{ name, path }[]` `<Breadcrumbs>` renders, so the two cannot disagree. */
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
