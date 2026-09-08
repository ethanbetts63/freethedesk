import "@/styles/portal.css";

import type { Metadata } from "next";

import { SeoPortalShell } from "@/components/dashboard/SeoPortalShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SeoPortalLayout({ children }: { children: React.ReactNode }) {
  return <SeoPortalShell>{children}</SeoPortalShell>;
}
