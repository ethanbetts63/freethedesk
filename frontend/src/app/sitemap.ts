import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://freethedesk.com.au").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-09-05T00:00:00+08:00");
  const pages = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/licensing", changeFrequency: "weekly" as const, priority: 0.95 },
    { path: "/websites", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/website-development-perth", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/dealership-website-builder", changeFrequency: "monthly" as const, priority: 0.85 },
    { path: "/automation", changeFrequency: "monthly" as const, priority: 0.75 },
    { path: "/work/scooter-shop", changeFrequency: "monthly" as const, priority: 0.75 },
    { path: "/contact", changeFrequency: "yearly" as const, priority: 0.65 },
    { path: "/login", changeFrequency: "yearly" as const, priority: 0.25 },
    { path: "/legal/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/legal/dealer-subscription-terms", changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  return pages.map((page) => ({
    url: `${siteUrl}${page.path}`,
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
