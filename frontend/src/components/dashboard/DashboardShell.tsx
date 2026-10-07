'use client';

import {
  Inbox,
  Mail,
  ReceiptText,
  Search,
  Settings,
  SlidersHorizontal,
  Store,
  Users,
} from 'lucide-react';

import type { DashboardNavSection } from '@/components/layout/DashboardLayout';

import { PortalShell } from './PortalShell';

const sections: DashboardNavSection[] = [
  {
    items: [
      { href: '/dashboard/admin/enquiries', label: 'Enquiries', icon: <Inbox /> },
      { href: '/dashboard/admin/messages', label: 'Messages', icon: <Mail /> },
    ],
  },
  {
    label: 'Customers',
    items: [
      { href: '/dashboard/admin/dealers', label: 'Dealers', icon: <Store /> },
      { href: '/dashboard/admin/seo', label: 'SEO', icon: <Search /> },
      { href: '/dashboard/admin/users', label: 'Users', icon: <Users /> },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/dashboard/admin/invoices', label: 'Invoices', icon: <ReceiptText /> },
      {
        href: '/dashboard/admin/settings/invoicing',
        label: 'Invoice settings',
        icon: <Settings />,
      },
    ],
  },
  {
    label: 'Settings',
    items: [
      {
        href: '/dashboard/admin/settings/site',
        label: 'Site settings',
        icon: <SlidersHorizontal />,
      },
    ],
  },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell role="staff" label="Admin dashboard" sections={sections}>
      {children}
    </PortalShell>
  );
}
