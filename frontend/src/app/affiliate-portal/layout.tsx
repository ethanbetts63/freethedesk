import type { Metadata } from 'next';

import { AffiliatePortalShell } from '@/components/dashboard/AffiliatePortalShell';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: {
    absolute: 'Affiliate portal - freethedesk',
    template: '%s - Affiliate portal - freethedesk',
  },
  robots: { index: false, follow: false },
};

export default function AffiliatePortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AffiliatePortalShell>{children}</AffiliatePortalShell>
    </AuthProvider>
  );
}
