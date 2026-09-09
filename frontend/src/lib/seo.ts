import type { Metadata } from "next";

import { PUBLIC_SITE_URL } from "./siteConfig";

const SITE_NAME = "freethedesk";
const DEFAULT_OG_IMAGE = "/og-images/og-default.webp";
const CONTACT_EMAIL = "hello@freethedesk.com.au";

/**
 * The single business entity every other node points at via `@id`.
 *
 * Typed `ProfessionalService` (a LocalBusiness subtype) rather than a bare
 * Organization so the Perth address carries local weight, while `areaServed`
 * keeps the national service area honest. Only verifiable facts belong here -
 * no phone or opening hours until there is a real one to publish.
 */
export function buildOrganizationSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${PUBLIC_SITE_URL}/#organization`,
    name: SITE_NAME,
    url: PUBLIC_SITE_URL,
    email: CONTACT_EMAIL,
    logo: {
      "@type": "ImageObject",
      url: `${PUBLIC_SITE_URL}/logo-512x512.png`,
      width: 512,
      height: 512,
    },
    image: `${PUBLIC_SITE_URL}/logo-512x512.png`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dianella",
      addressRegion: "WA",
      postalCode: "6059",
      addressCountry: "AU",
    },
    identifier: {
      "@type": "PropertyValue",
      propertyID: "ABN",
      value: "11493753896",
    },
    areaServed: { "@type": "Country", name: "Australia" },
  };
}

export function buildWebsiteSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${PUBLIC_SITE_URL}/#website`,
    name: SITE_NAME,
    url: PUBLIC_SITE_URL,
    publisher: { "@id": `${PUBLIC_SITE_URL}/#organization` },
  };
}

/**
 * The per-page WebPage entity, linked to the sitewide Organization/WebSite via @id.
 *
 * `updated` emits `dateModified`, which is the only freshness signal a marketing
 * page has - articles carry their own dates from front matter. Bump it in PAGES
 * when a page's content materially changes, the same way an article's `updated`
 * is bumped; a date that never moves is worse than no date.
 */
export function buildWebPageSchema(options: {
  title: string;
  description?: string;
  path: string;
  updated?: string;
}): object {
  const url = `${PUBLIC_SITE_URL}${options.path}`;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: options.title,
    ...(options.description ? { description: options.description } : {}),
    ...(options.updated ? { dateModified: options.updated } : {}),
    isPartOf: { "@id": `${PUBLIC_SITE_URL}/#website` },
    publisher: { "@id": `${PUBLIC_SITE_URL}/#organization` },
  };
}

export function buildBreadcrumbSchema(items: { name: string; path: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${PUBLIC_SITE_URL}${item.path}`,
    })),
  };
}

/** Breadcrumb items from Home to `path`, inferred from the segments; `label` names the last crumb. */
export function buildBreadcrumbItems(path: string, label: string): { name: string; path: string }[] {
  if (path === "/") return [{ name: "Home", path: "/" }];

  const segments = path.split("/").filter(Boolean);
  const crumbs = [{ name: "Home", path: "/" }];

  segments.forEach((segment, index) => {
    const segmentPath = `/${segments.slice(0, index + 1).join("/")}`;
    const isLast = index === segments.length - 1;
    crumbs.push({ name: isLast ? label : titleCaseSlug(segment), path: segmentPath });
  });

  return crumbs;
}

function titleCaseSlug(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/**
 * Builds a page's <head> metadata (canonical, Open Graph, Twitter Card) from a
 * single title/description/path so the three can't drift apart.
 *
 * Set `absoluteTitle: true` when a title must remain immune to any title
 * templates introduced by a parent layout in the future.
 */
export function pageMetadata(options: {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  absoluteTitle?: boolean;
  openGraphType?: "website" | "article";
}): Metadata {
  const canonicalUrl = `${PUBLIC_SITE_URL}${options.path}`;
  const imageUrl = `${PUBLIC_SITE_URL}${options.ogImage ?? DEFAULT_OG_IMAGE}`;

  return {
    title: options.absoluteTitle ? { absolute: options.title } : options.title,
    description: options.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: options.title,
      description: options.description,
      type: options.openGraphType ?? "website",
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
      images: [imageUrl],
    },
  };
}

export function buildArticleSchema(article: {
  slug: string;
  title: string;
  excerpt: string;
  authorName: string;
  publishedDate: string;
  lastModified: string;
}): object {
  const url = `${PUBLIC_SITE_URL}/${article.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: article.title,
    description: article.excerpt,
    url,
    mainEntityOfPage: { "@id": `${url}#webpage` },
    author: { "@type": "Person", name: article.authorName },
    publisher: { "@id": `${PUBLIC_SITE_URL}/#organization` },
    datePublished: article.publishedDate,
    dateModified: article.lastModified,
  };
}
