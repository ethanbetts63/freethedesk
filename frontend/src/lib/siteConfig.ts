// Default to the canonical host. The apex 308-redirects to www, so an apex
// default would silently publish redirecting URLs in canonicals, @ids, OG
// tags and the sitemap wherever NEXT_PUBLIC_SITE_URL is unset.
export const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.freethedesk.com.au").replace(
  /\/$/,
  "",
);
export const METADATA_BASE_URL = PUBLIC_SITE_URL;

export const PORTFOLIO_NAVIGATION = [
  { href: "/portfolio/scooter-shop", label: "Scooter Shop" },
  { href: "/portfolio/bloomprint", label: "Bloomprint" },
] as const;

export const PRIMARY_NAVIGATION = [
  { href: "/website-development", label: "Websites" },
  { href: "/automation", label: "Automation" },
  { href: "/seo", label: "SEO" },
  { href: "/dealers", label: "Dealers" },
  { href: "/licensing", label: "Online licensing" },
  { href: "/contact", label: "Contact" },
] as const;

export const FOOTER_NAVIGATION = [
  { href: "/website-development", label: "Website Development" },
  { href: "/dealers", label: "Dealer websites" },
  { href: "/guides", label: "Guides & articles" },
  { href: "/licensing", label: "Online licensing" },
  { href: "/automation", label: "Automation" },
  { href: "/seo", label: "SEO" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Login" },
] as const;
