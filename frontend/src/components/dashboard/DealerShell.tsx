'use client';

import { ClipboardList, Gauge, PlusCircle, Settings, UserRound } from 'lucide-react';

import type { DashboardNavSection } from '@/components/layout/DashboardLayout';

import { PortalShell } from './PortalShell';

const sections: DashboardNavSection[] = [
  {
    items: [
      // First, because it is the only screen a working dealer opens daily.
      { href: '/portal/sales', label: 'Sales', icon: <ClipboardList /> },
      { href: '/portal/sales/new', label: 'New sale', icon: <PlusCircle />, sub: true },
      { href: '/portal/overview', label: 'Overview', icon: <Gauge /> },
      { href: '/portal/setup', label: 'Dealership setup', icon: <Settings /> },
      { href: '/portal/account', label: 'Account', icon: <UserRound /> },
    ],
  },
];

export function DealerShell({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell role="dealer" label="Dealer portal" sections={sections}>
      {children}
    </PortalShell>
  );
}
