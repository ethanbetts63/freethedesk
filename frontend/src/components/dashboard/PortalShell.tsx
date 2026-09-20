'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CHANGE_PASSWORD_PATH, homeFor, type Role } from '@/lib/api';
import { adminLoadingClassName, chromeHairlineClassName } from './dashboardChrome';
import { cn } from '@/lib/utils';
import { brandClassName } from '@/components/ui/layout';

export interface NavItem {
  href: string;
  label: string;
}

/**
 * The shell is a top bar on a phone and a left rail from `lg`. That is one
 * layout change, not two: below `lg` the sidebar is a grid whose second row is
 * the nav, and from `lg` it is a sticky flex column. Everything else — the
 * brand, the label, the account block — keeps its order in both.
 */
const sidebarClassName = cn(
  'relative top-0 grid min-h-0 grid-cols-[minmax(0,1fr)_auto] items-center border-b border-border-strong bg-surface-tint-strong px-m py-s',
  'sm:grid-cols-[auto_minmax(0,1fr)_auto]',
  'lg:sticky lg:flex lg:min-h-screen lg:flex-[0_0_244px] lg:flex-col lg:items-stretch lg:border-r lg:border-b-0 lg:border-r-border-strong lg:px-m lg:pt-l lg:pb-ml',
);

const navClassName = cn(
  'col-span-full row-start-2 mt-xs flex flex-1 flex-row justify-start gap-3xs p-0',
  'sm:col-auto sm:row-auto sm:mt-0 sm:justify-center',
  'lg:flex-col lg:justify-start lg:pt-l',
);

const navLinkClassName = 'rounded-sm px-s py-xs text-body font-strong lg:p-s';
const navLinkRestClassName = 'text-text-muted hover:bg-tint-wash hover:text-text-primary';
const navLinkActiveClassName = 'bg-tint-wash text-text-primary';

export function PortalShell({
  role,
  label,
  nav,
  homeHref,
  children,
}: {
  role: Role;
  label: string;
  nav: NavItem[];
  homeHref: string;
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
    <div className="block min-h-screen bg-surface-tint lg:flex">
      <aside className={sidebarClassName}>
        <Link className={brandClassName} href={homeHref}>
          free<span>the</span>desk<i>.</i>
        </Link>
        {/* The section name only earns its line once the rail is vertical. */}
        <div
          className={cn(
            'mt-xs hidden border-b pb-l text-caption font-heavy tracking-label text-text-subtle uppercase lg:block',
            chromeHairlineClassName,
          )}
        >
          {label}
        </div>
        <nav className={navClassName}>
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  navLinkClassName,
                  active ? navLinkActiveClassName : navLinkRestClassName,
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div
          className={cn(
            'block gap-s lg:flex lg:flex-col lg:border-t lg:pt-m',
            chromeHairlineClassName,
          )}
        >
          {/* The account name is cut below `lg`: the top bar has no room for it
              and the log-out control is the only part that has to be reachable. */}
          <span className="hidden overflow-hidden text-ellipsis text-label text-text-muted lg:block">
            {user.dealer?.business_name || user.seo?.business_name || user.email || user.username}
          </span>
          <button
            type="button"
            className="cursor-pointer border-0 bg-transparent p-0 text-left text-body-sm font-heavy whitespace-nowrap lg:whitespace-normal"
            onClick={async () => {
              await logout();
              router.replace('/login');
            }}
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="min-h-screen w-full min-w-0 overflow-visible">{children}</main>
    </div>
  );
}
