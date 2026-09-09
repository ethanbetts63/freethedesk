import type { Metadata } from "next";

import { PUBLIC_SITE_URL } from "./siteConfig";

const SITE_NAME = "Free the Desk";
const DEFAULT_OG_IMAGE = "/og-images/og-default.webp";

export function buildOrganizationSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${PUBLIC_SITE_URL}/#organization`,
    name: SITE_NAME,
    url: PUBLIC_SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${PUBLIC_SITE_URL}/logo-512x512.png`,
      width: 512,
      height: 512,
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

/** The per-page WebPage entity, linked to the sitewide Organization/WebSite via @id. */
export function buildWebPageSchema(options: { title: string; description?: string; path: string }): object {
  const url = `${PUBLIC_SITE_URL}${options.path}`;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: options.title,
    ...(options.description ? { description: options.description } : {}),
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
 * Set `absoluteTitle: true` when `title` is already final — otherwise the root
 * layout's "%s | Free the Desk" template appends the brand suffix a second time.
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
