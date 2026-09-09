import type { Metadata } from "next";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
