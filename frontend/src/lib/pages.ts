import type { Metadata } from "next";

import { buildBreadcrumbItems, pageMetadata } from "./seo";

export interface PageDefinition {
  title: string;
  description: string;

  /** ISO date of the last material content change; emitted as `dateModified`. */
  updated?: string;

  /**
   * Short name for the final breadcrumb crumb. Breadcrumbs are rendered by
   * Google, so they need a plain label - the SEO `title` carries a tagline and
   * a keyword tail that read as noise in a trail.
   */
  label?: string;

  absoluteTitle?: boolean;
  ogImage?: string;

  sitemap?: { changeFrequency: "weekly" | "monthly" | "yearly"; priority: number };
}

export const PAGES = {
  "/": {
    updated: "2026-09-09",
    label: "Home",
    title: "Fire your admin | Websites & Digital Automation | Australia, Perth",
    description: "Dealer websites and operational systems for Australian vehicle, equipment and leisure dealerships.",
    absoluteTitle: true,
    sitemap: { changeFrequency: "weekly", priority: 1 },
  },
  "/dealers": {
    updated: "2026-09-09",
    label: "Dealer websites",
    title: "Fire your admin | Online Licensing & Digital Dealerships Australia, Perth",
    description: "Dealer websites and operational systems for Australian vehicle, equipment and leisure dealerships.",
    sitemap: { changeFrequency: "weekly", priority: 0.95 },
  },
  "/licensing": {
    updated: "2026-09-09",
    label: "Online licensing",
    title: "Signed, sealed, delivered—sell more | Online Vehicle Licensing Australia",
    description:
      "Let customers verify their identity, complete vehicle licensing and sign paperwork online without an unnecessary dealership visit.",
    sitemap: { changeFrequency: "weekly", priority: 0.95 },
  },
  "/website-development": {
    updated: "2026-09-09",
    label: "Website development",
    title: "Make your website work harder | Website Development & Automation Perth",
    description:
      "Website Development for businesses that need more than a template: custom websites, ecommerce, integrations and practical web applications.",
    absoluteTitle: true,
    sitemap: { changeFrequency: "weekly", priority: 0.9 },
  },
  "/dealership-website-builder": {
    updated: "2026-09-08",
    label: "Website builder",
    title: "Interactive Digital Dealership Builder | Custom Dealer Websites & Automation",
    description: "Configure a dealership website around the way your business sells, books and grows.",
    sitemap: { changeFrequency: "monthly", priority: 0.85 },
  },
  "/automation": {
    updated: "2026-09-09",
    label: "Automation",
    title: "Stop paying for copy-paste | Business Automation Australia, Perth",
    description: "Practical workflow automation and custom integrations for Australian small and medium businesses.",
    sitemap: { changeFrequency: "monthly", priority: 0.75 },
  },
  "/seo": {
    updated: "2026-09-09",
    label: "SEO reports",
    title: "Find your missing clicks | SEO Reports & Audits Australia",
    description: "See what is working, what is holding your website back and where the best search opportunities are.",
    sitemap: { changeFrequency: "monthly", priority: 0.75 },
  },
  "/guides": {
    updated: "2026-09-09",
    label: "Guides",
    title: "Steal our playbook | Dealership Website & Automation Guides",
    description:
      "Practical guides for Australian dealerships on websites, search visibility, online sales, licensing and better operational systems.",
    sitemap: { changeFrequency: "weekly", priority: 0.7 },
  },
  "/portfolio/scooter-shop": {
    updated: "2026-09-08",
    label: "Scooter Shop",
    title: "How one dealership grew organic clicks 300% | Dealer Website Case Study",
    description:
      "A connected dealership website for sales, online purchasing, licensing, parts, service, hire and long-term organic growth.",
    ogImage: "/case-studies/scooter-shop/home-desktop.png",
    sitemap: { changeFrequency: "monthly", priority: 0.75 },
  },
  "/portfolio/bloomprint": {
    updated: "2026-09-08",
    label: "Bloomprint",
    title: "Sell flowers without showing the flowers? | Marketplace Website Case Study",
    description:
      "A two-sided flower delivery marketplace: brief-led ordering for customers, paid local orders for independent florists, and a landing page system built to be found.",
    ogImage: "/case-studies/bloomprint/home-desktop.png",
    sitemap: { changeFrequency: "monthly", priority: 0.75 },
  },
  "/contact": {
    updated: "2026-09-08",
    label: "Contact",
    title: "Bring us the bottleneck | Website & Automation Developers Australia, Perth",
    description:
      "Talk to freethedesk about a custom website, online licensing product, web application or business automation project.",
    sitemap: { changeFrequency: "yearly", priority: 0.65 },
  },
  "/legal/privacy": {
    updated: "2026-09-08",
    label: "Privacy policy",
    title: "Privacy Policy",
    description: "How freethedesk collects, uses, stores and discloses personal information.",
    sitemap: { changeFrequency: "yearly", priority: 0.3 },
  },
  "/legal/dealer-subscription-terms": {
    updated: "2026-09-08",
    label: "Dealer subscription terms",
    title: "Dealer Subscription Terms",
    description: "Terms for freethedesk dealer licensing and contract subscriptions.",
    sitemap: { changeFrequency: "yearly", priority: 0.3 },
  },
  "/legal/seo-subscription-terms": {
    updated: "2026-09-08",
    label: "SEO reporting terms",
    title: "SEO Reporting & Audit Terms",
    description: "Terms for freethedesk SEO reporting and audit services.",
    sitemap: { changeFrequency: "yearly", priority: 0.3 },
  },
} as const satisfies Record<string, PageDefinition>;

export type PagePath = keyof typeof PAGES;

export function metadataFor(path: PagePath): Metadata {
  const page: PageDefinition = PAGES[path];
  return pageMetadata({ ...page, path });
}

/**
 * Breadcrumb trail for a page, with the short `label` as the final crumb.
 *
 * Segments that are not real pages are dropped: `/portfolio` and `/legal` are
 * directories with no route of their own, and both 404. Linking or publishing a
 * crumb that 404s is worse than a shorter trail, and running the visible
 * breadcrumbs and the BreadcrumbList schema off this one function is what keeps
 * the two from drifting apart.
 */
export function breadcrumbItemsFor(path: PagePath): { name: string; path: string }[] {
  const { title, label } = PAGES[path];
  return buildBreadcrumbItems(path, label ?? title).filter((item) => item.path in PAGES);
}
