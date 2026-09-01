"use client";

import { PortalShell } from "./PortalShell";

const nav = [
  { href: "/dashboard/enquiries", label: "Enquiries" },
  { href: "/dashboard/dealers", label: "Dealers" },
  { href: "/dashboard/messages", label: "Messages" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell role="staff" label="Admin dashboard" nav={nav} homeHref="/dashboard/enquiries">
      {children}
    </PortalShell>
  );
}
