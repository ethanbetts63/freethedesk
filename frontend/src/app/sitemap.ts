import type { MetadataRoute } from "next";

import { PUBLIC_SITE_URL } from "@/lib/siteConfig";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { path: "", lastModified: "2026-09-05", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/licensing", lastModified: "2026-09-05", changeFrequency: "weekly" as const, priority: 0.95 },
    { path: "/website-development-perth", lastModified: "2026-09-05", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/dealership-website-builder", lastModified: "2026-09-05", changeFrequency: "monthly" as const, priority: 0.85 },
    { path: "/automation", lastModified: "2026-09-05", changeFrequency: "monthly" as const, priority: 0.75 },
    { path: "/work/scooter-shop", lastModified: "2026-09-05", changeFrequency: "monthly" as const, priority: 0.75 },
    { path: "/contact", lastModified: "2026-09-05", changeFrequency: "yearly" as const, priority: 0.65 },
    { path: "/login", lastModified: "2026-09-05", changeFrequency: "yearly" as const, priority: 0.25 },
    { path: "/legal/privacy", lastModified: "2026-09-05", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/legal/dealer-subscription-terms", lastModified: "2026-09-05", changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  return pages.map((page) => ({
    url: `${PUBLIC_SITE_URL}${page.path}`,
    lastModified: new Date(`${page.lastModified}T00:00:00+08:00`),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
