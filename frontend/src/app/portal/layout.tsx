import "@/styles/portal.css";

import type { Metadata } from "next";

import { DealerShell } from "@/components/dashboard/DealerShell";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DealerShell>{children}</DealerShell>
    </AuthProvider>
  );
}
