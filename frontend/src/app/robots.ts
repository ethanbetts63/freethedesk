import type { MetadataRoute } from "next";

import { PUBLIC_SITE_URL } from "@/lib/siteConfig";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/portal",
        "/licensing/payment",
      ],
    },
    sitemap: `${PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
