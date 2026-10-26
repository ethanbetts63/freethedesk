/* Component registry: freetheplatform/frontend/registry/src/components/layout/SessionLink.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import Link from 'next/link';
import type { ReactNode } from 'react';

import { logout } from '@/lib/logout';
import { hasSession } from '@/lib/session';
import { cn } from '@/lib/utils';

interface SessionLinkProps {
  /** The already-resolved nav classes: `NAV_LINK[style]` in the desktop row, `mobileNavRowClassName` in the panel. */
  className: string;
  /** Drawn after the word in both states — the panel's arrow. */
  trailing?: ReactNode;
  loginLabel?: string;
  logoutLabel?: string;
  /** Shown before Log out when signed in: the site's role-resolving entry to its portals. */
  dashboardHref?: string;
  dashboardLabel?: string;
}

/**
 * The account entry in the public chrome: a link to sign in, or a button that
 * signs out, decided on the server from cookie presence (`lib/session`). Both
 * states wear the composition's own nav classes, so the button is read as the
 * link it replaces; `w-full` is there because a button does not stretch to its
 * row the way a block link does.
 *
 * `dashboardHref` is a single address for every role, because the cookie says
 * nothing about which portal is theirs: point it at a route that asks Django
 * who they are and redirects, so the one profile request happens on the click
 * and never on a page view.
 */
export async function SessionLink({
  className,
  trailing,
  loginLabel = 'Log in',
  logoutLabel = 'Log out',
  dashboardHref,
  dashboardLabel = 'Dashboard',
}: SessionLinkProps) {
  if (!(await hasSession())) {
    return (
      <Link href="/login" className={className}>
        {loginLabel}
        {trailing}
      </Link>
    );
  }

  return (
    <>
      {dashboardHref && (
        <Link href={dashboardHref} className={className}>
          {dashboardLabel}
          {trailing}
        </Link>
      )}
      <form action={logout} className="contents">
        <button type="submit" className={cn('w-full cursor-pointer', className)}>
          {logoutLabel}
          {trailing}
        </button>
      </form>
    </>
  );
}
