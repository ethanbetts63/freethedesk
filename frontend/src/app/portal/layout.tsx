import type { Metadata } from 'next';

import { DealerShell } from '@/components/dashboard/DealerShell';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  // Each section's layout names it; the area ends the title.
  title: { absolute: 'Dealer portal - freethedesk', template: '%s - Dealer portal - freethedesk' },
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DealerShell>{children}</DealerShell>
    </AuthProvider>
  );
}
