"use client";

import { PortalShell } from "./PortalShell";

const nav = [
  { href: "/portal/overview", label: "Overview" },
  { href: "/portal/setup", label: "Dealership setup" },
  { href: "/portal/account", label: "Account" },
];

export function DealerShell({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell role="dealer" label="Dealer portal" nav={nav} homeHref="/portal/overview">
      {children}
    </PortalShell>
  );
}
