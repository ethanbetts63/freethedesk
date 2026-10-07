'use client';

import { PortalShell } from './PortalShell';

const nav = [
  { href: '/dashboard/admin/enquiries', label: 'Enquiries' },
  { href: '/dashboard/admin/dealers', label: 'Dealers' },
  { href: '/dashboard/admin/seo', label: 'SEO' },
  { href: '/dashboard/admin/invoices', label: 'Invoices' },
  { href: '/dashboard/admin/users', label: 'Users' },
  { href: '/dashboard/admin/messages', label: 'Messages' },
  { href: '/dashboard/admin/settings/site', label: 'Site settings' },
  { href: '/dashboard/admin/settings/invoicing', label: 'Invoice settings' },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell role="staff" label="Admin dashboard" nav={nav}>
      {children}
    </PortalShell>
  );
}
