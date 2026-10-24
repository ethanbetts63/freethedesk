import type { Metadata } from 'next';

import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  // Each section's layout names it; the area ends the title.
  title: { absolute: 'Admin - freethedesk', template: '%s - Admin - freethedesk' },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
