'use client';

import { Gauge, Settings, UserRound } from 'lucide-react';

import type { DashboardNavSection } from '@/components/layout/DashboardLayout';

import { PortalShell } from './PortalShell';

const sections: DashboardNavSection[] = [
  {
    items: [
      { href: '/seo-portal/overview', label: 'Overview', icon: <Gauge /> },
      { href: '/seo-portal/setup', label: 'Setup', icon: <Settings /> },
      { href: '/seo-portal/account', label: 'Account', icon: <UserRound /> },
    ],
  },
];

export function SeoPortalShell({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell role="seo" label="SEO portal" sections={sections}>
      {children}
    </PortalShell>
  );
}
