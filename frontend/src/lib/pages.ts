import type { Metadata } from "next";

import { pageMetadata } from "./seo";

export interface PageDefinition {
  title: string;
  description: string;

  absoluteTitle?: boolean;
  ogImage?: string;

  sitemap?: { changeFrequency: "weekly" | "monthly" | "yearly"; priority: number };
}

export const PAGES = {
  "/": {
    title: "Fire your admin | Websites & Digital Automation | Australia, Perth",
    description: "Dealer websites and operational systems for Australian vehicle, equipment and leisure dealerships.",
    absoluteTitle: true,
    sitemap: { changeFrequency: "weekly", priority: 1 },
  },
  "/dealers": {
    title: "Fire your admin | Online Licensing & Digital Dealerships Australia, Perth",
    description: "Dealer websites and operational systems for Australian vehicle, equipment and leisure dealerships.",
    sitemap: { changeFrequency: "weekly", priority: 0.95 },
  },
  "/licensing": {
    title: "Signed, sealed, delivered—sell more | Online Vehicle Licensing Australia",
    description:
      "Let customers verify their identity, complete vehicle licensing and sign paperwork online without an unnecessary dealership visit.",
    sitemap: { changeFrequency: "weekly", priority: 0.95 },
  },
  "/website-development": {
    title: "Make your website work harder | Website Development & Automation Perth",
    description:
      "Website Development for businesses that need more than a template: custom websites, ecommerce, integrations and practical web applications.",
    absoluteTitle: true,
    sitemap: { changeFrequency: "weekly", priority: 0.9 },
  },
  "/dealership-website-builder": {
    title: "Interactive Digital Dealership Builder | Custom Dealer Websites & Automation",
    description: "Configure a dealership website around the way your business sells, books and grows.",
    sitemap: { changeFrequency: "monthly", priority: 0.85 },
  },
  "/automation": {
    title: "Stop paying for copy-paste | Business Automation Australia, Perth",
    description: "Practical workflow automation and custom integrations for Australian small and medium businesses.",
    sitemap: { changeFrequency: "monthly", priority: 0.75 },
  },
  "/seo": {
    title: "Find your missing clicks | SEO Reports & Audits Australia",
    description: "See what is working, what is holding your website back and where the best search opportunities are.",
    sitemap: { changeFrequency: "monthly", priority: 0.75 },
  },
  "/guides": {
    title: "Steal our playbook | Dealership Website & Automation Guides",
    description:
      "Practical guides for Australian dealerships on websites, search visibility, online sales, licensing and better operational systems.",
    sitemap: { changeFrequency: "weekly", priority: 0.7 },
  },
  "/portfolio/scooter-shop": {
    title: "How one dealership grew organic clicks 200% | Dealer Website Case Study",
    description:
      "A connected dealership website for sales, online purchasing, licensing, parts, service, hire and long-term organic growth.",
    ogImage: "/case-studies/scooter-shop/home-desktop.png",
    sitemap: { changeFrequency: "monthly", priority: 0.75 },
  },
  "/portfolio/bloomprint": {
    title: "Sell flowers without showing the flowers? | Marketplace Website Case Study",
    description:
      "A two-sided flower delivery marketplace: brief-led ordering for customers, paid local orders for independent florists, and a landing page system built to be found.",
    ogImage: "/case-studies/bloomprint/home-desktop.png",
    sitemap: { changeFrequency: "monthly", priority: 0.75 },
  },
  "/contact": {
    title: "Bring us the bottleneck | Website & Automation Developers Australia, Perth",
    description:
      "Talk to freethedesk about a custom website, online licensing product, web application or business automation project.",
    sitemap: { changeFrequency: "yearly", priority: 0.65 },
  },
  "/legal/privacy": {
    title: "Privacy Policy",
    description: "How freethedesk collects, uses, stores and discloses personal information.",
    sitemap: { changeFrequency: "yearly", priority: 0.3 },
  },
  "/legal/dealer-subscription-terms": {
    title: "Dealer Subscription Terms",
    description: "Terms for freethedesk dealer licensing and contract subscriptions.",
    sitemap: { changeFrequency: "yearly", priority: 0.3 },
  },
  "/legal/seo-subscription-terms": {
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
