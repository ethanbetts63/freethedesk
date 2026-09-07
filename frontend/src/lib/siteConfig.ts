export const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://freethedesk.com.au").replace(/\/$/, "");
export const METADATA_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const WEBSITE_NAVIGATION = [
  { href: "/website-development", label: "All websites" },
  { href: "/", label: "Dealer websites" },
] as const;

export const PORTFOLIO_NAVIGATION = [
  { href: "/portfolio/scooter-shop", label: "Scooter Shop" },
  { href: "/portfolio/bloomprint", label: "Bloomprint" },
] as const;

/** Entries carrying `items` render as a dropdown; the rest are plain links. */
export const PRIMARY_NAVIGATION = [
  { href: "/licensing", label: "Online licensing" },
  { href: "/automation", label: "Automation" },
  { href: "/seo", label: "SEO" },
  { label: "Portfolio", items: PORTFOLIO_NAVIGATION },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Login" },
] as const;

export const FOOTER_NAVIGATION = [
  { href: "/website-development", label: "Perth website development" },
  { href: "/", label: "Dealer websites" },
  { href: "/guides", label: "Guides & articles" },
  { href: "/licensing", label: "Online licensing" },
  { href: "/automation", label: "Automation" },
  { href: "/seo", label: "SEO" },
  { href: "/portfolio/scooter-shop", label: "Scooter Shop case study" },
  { href: "/portfolio/bloomprint", label: "Bloomprint case study" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Login" },
] as const;
