import type { Metadata } from "next";

import { DealerShell } from "@/components/dashboard/DealerShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <DealerShell>{children}</DealerShell>;
}
