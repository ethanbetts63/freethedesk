"use client";

import { PortalShell } from "./PortalShell";

const nav = [
  { href: "/seo-portal/overview", label: "Overview" },
  { href: "/seo-portal/connect", label: "Connect data" },
  { href: "/seo-portal/account", label: "Account" },
];

export function SeoPortalShell({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell role="seo" label="SEO portal" nav={nav} homeHref="/seo-portal/overview">
      {children}
    </PortalShell>
  );
}
