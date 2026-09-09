import type { MetadataRoute } from "next";

import { getAllArticleMeta } from "@/lib/articles";
import { PAGES } from "@/lib/pages";
import { PUBLIC_SITE_URL } from "@/lib/siteConfig";

export default function sitemap(): MetadataRoute.Sitemap {
  const builtAt = new Date();

  const staticPages = Object.entries(PAGES)
    .filter(([, page]) => page.sitemap)
    .map(([path, page]) => ({
      url: `${PUBLIC_SITE_URL}${path === "/" ? "" : path}`,
      lastModified: builtAt,
      changeFrequency: page.sitemap!.changeFrequency,
      priority: page.sitemap!.priority,
    }));

  const articlePages = getAllArticleMeta().map((article) => ({
    url: `${PUBLIC_SITE_URL}/${article.slug}`,
    lastModified: new Date(`${article.lastModified}T00:00:00+08:00`),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  return [...staticPages, ...articlePages];
}
