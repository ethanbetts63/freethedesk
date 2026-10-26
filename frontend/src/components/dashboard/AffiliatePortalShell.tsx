'use client';

import { Banknote, FileSearch, Megaphone, Receipt, Ticket, UserRound } from 'lucide-react';

import type { DashboardNavSection } from '@/components/layout/DashboardLayout';

import { PortalShell } from './PortalShell';

const sections: DashboardNavSection[] = [
  {
    items: [
      { href: '/affiliate-portal/sales', label: 'Sales', icon: <Receipt /> },
      { href: '/affiliate-portal/payments', label: 'Payments', icon: <Banknote /> },
      { href: '/affiliate-portal/codes', label: 'Codes', icon: <Ticket /> },
      { href: '/affiliate-portal/promote', label: 'Promote', icon: <Megaphone /> },
      { href: '/affiliate-portal/audit', label: 'Your free audit', icon: <FileSearch /> },
      { href: '/affiliate-portal/account', label: 'Account', icon: <UserRound /> },
    ],
  },
];

export function AffiliatePortalShell({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell role="affiliate" label="Affiliate portal" sections={sections}>
      {children}
    </PortalShell>
  );
}
