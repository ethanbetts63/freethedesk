export const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://freethedesk.com.au").replace(/\/$/, "");
export const METADATA_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const WEBSITE_NAVIGATION = [
  { href: "/website-development-perth", label: "All websites" },
  { href: "/", label: "Dealer websites" },
] as const;

export const PRIMARY_NAVIGATION = [
  { href: "/licensing", label: "Online licensing" },
  { href: "/automation", label: "Automation" },
  { href: "/work/scooter-shop", label: "Our work" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Login" },
] as const;

export const FOOTER_NAVIGATION = [
  { href: "/website-development-perth", label: "Perth website development" },
  { href: "/", label: "Dealer websites" },
  { href: "/licensing", label: "Online licensing" },
  { href: "/automation", label: "Automation" },
  { href: "/work/scooter-shop", label: "Scooter Shop case study" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Login" },
] as const;
