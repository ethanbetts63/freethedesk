'use client';

import { PortalShell } from './PortalShell';

const nav = [
  // First, because it is the only screen a working dealer opens daily.
  { href: '/portal/sales', label: 'Sales' },
  { href: '/portal/overview', label: 'Overview' },
  { href: '/portal/setup', label: 'Dealership setup' },
  { href: '/portal/account', label: 'Account' },
];

export function DealerShell({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell role="dealer" label="Dealer portal" nav={nav} homeHref="/portal/overview">
      {children}
    </PortalShell>
  );
}
