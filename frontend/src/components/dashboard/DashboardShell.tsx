"use client";

import { PortalShell } from "./PortalShell";

const nav = [
  { href: "/dashboard/enquiries", label: "Enquiries" },
  { href: "/dashboard/dealers", label: "Dealers" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/settings/licensing", label: "Licensing settings" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell role="staff" label="Admin dashboard" nav={nav} homeHref="/dashboard/enquiries">
      {children}
    </PortalShell>
  );
}
