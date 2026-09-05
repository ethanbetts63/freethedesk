import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://freethedesk.com.au").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/portal",
        "/dealers/signup",
        "/licensing/payment",
        "/website-builder",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
