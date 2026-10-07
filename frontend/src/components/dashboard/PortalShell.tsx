'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { DashboardLayout, type DashboardNavSection } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { CHANGE_PASSWORD_PATH, homeFor, type Role } from '@/lib/api';

import { adminLoadingClassName } from './dashboardChrome';

/**
 * The three signed-in portals (staff, dealer, SEO): who may enter, then the shared dashboard rail
 * from the component registry. Each portal passes its own sections; the rail itself is the one
 * allbikes and bloomprint use.
 */
export function PortalShell({
  role,
  label,
  sections,
  children,
}: {
  role: Role;
  label: string;
  sections: readonly DashboardNavSection[];
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    // A password somebody else chose comes before the portal, whichever portal
    // it is. Here rather than in each shell, so a new one inherits the gate.
    else if (user.must_change_password) router.replace(CHANGE_PASSWORD_PATH);
    // Wrong portal but signed in — send them to their own, not back through login.
    else if (user.role !== role) router.replace(homeFor(user));
  }, [loading, pathname, role, router, user]);

  if (loading || !user || user.must_change_password || user.role !== role)
    return <div className={adminLoadingClassName}>Loading…</div>;

  return (
    <DashboardLayout
      title="freethedesk"
      subtitle={label}
      sections={sections}
      accountName={
        user.dealer?.business_name || user.seo?.business_name || user.email || user.username
      }
      onLogout={async () => {
        await logout();
        router.replace('/login');
      }}
    >
      {/* The portals' cards are white, so their page is the tint behind them. */}
      <div className="min-h-screen bg-surface-tint">{children}</div>
    </DashboardLayout>
  );
}
