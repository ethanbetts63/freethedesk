import type { Metadata } from 'next';

import { SeoPortalShell } from '@/components/dashboard/SeoPortalShell';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: { absolute: 'SEO portal - freethedesk', template: '%s - SEO portal - freethedesk' },
  robots: { index: false, follow: false },
};

export default function SeoPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SeoPortalShell>{children}</SeoPortalShell>
    </AuthProvider>
  );
}
