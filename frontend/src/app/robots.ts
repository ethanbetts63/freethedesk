import type { MetadataRoute } from "next";

import { PUBLIC_SITE_URL } from "@/lib/siteConfig";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /dashboard, /portal and /licensing/payment are deliberately NOT disallowed here:
      // each carries its own noindex meta tag (see their layout/page metadata), and a
      // robots.txt disallow would stop Googlebot from ever crawling far enough to see it.
      disallow: ["/api/"],
    },
    sitemap: `${PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
