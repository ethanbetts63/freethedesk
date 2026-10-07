'use client';

/* Component registry: freetheplatform/frontend/registry/src/components/layout/DashboardLayout.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { useDetailsDismiss } from '@/hooks/useDisclosure';
import { focusRingClassName } from '@/lib/controlState';
import { cn } from '@/lib/utils';

export interface DashboardNavItem {
  href: string;
  label: string;
  /** Drawn at 16px (14px on a sub item). The composition supplies it, so the registry needs no icon set. */
  icon?: ReactNode;
  /** An indented child link, such as "Add booking" under "Diary". */
  sub?: boolean;
  /** Active only on an exact match, for a link whose path prefixes its siblings'. */
  end?: boolean;
  /** A count of things needing attention; hidden at zero. */
  badge?: number;
}

export interface DashboardNavSection {
  /** The heading above the group; omit it for the ungrouped links at the top. */
  label?: string;
  items: readonly DashboardNavItem[];
}

/**
 * The signed-in dashboards' frame: a dark rail of sectioned links beside the page, from allbikes'
 * admin. The rail carries a text title rather than the logo, which the site header above already
 * shows. Below `md` the rail becomes a bar whose menu opens the same links.
 *
 * Colours come from three tokens each site sets (`--surface-sidebar`, `--border-sidebar`,
 * `--accent-sidebar`), plus the shared on-dark text and the danger fill. The active link is marked by
 * weight, a wash and an accent bar rather than by hue alone.
 */
export function DashboardLayout({
  title,
  subtitle,
  sections,
  accountName,
  onLogout,
  children,
}: {
  title: string;
  subtitle: string;
  sections: readonly DashboardNavSection[];
  accountName: string;
  onLogout: () => void;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const dismissAnchor = useDetailsDismiss();

  const isActive = (item: DashboardNavItem) =>
    item.end ? pathname === item.href : pathname.startsWith(item.href);

  const links = (
    <nav className="flex-1 overflow-y-auto px-xs py-s" aria-label={subtitle}>
      {sections.map((section, index) => (
        <div key={section.label ?? `section-${index}`}>
          {section.label && (
            <p className="m-0 px-s pt-ml pb-3xs text-label font-control tracking-widest text-text-on-dark/30 uppercase select-none">
              {section.label}
            </p>
          )}
          {section.items.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex w-full items-center gap-s rounded-md pr-s text-body transition-colors',
                  focusRingClassName,
                  item.sub
                    ? // eslint-disable-next-line no-restricted-syntax -- the indent is two named rungs summed, and 14px is the sub icon allbikes drew at
                      'py-2xs pl-[calc(var(--spacing-l)+var(--spacing-xs))] [&>svg]:size-[14px]'
                    : 'py-xs pl-s [&>svg]:size-m',
                  '[&>svg]:shrink-0',
                  active
                    ? cn(
                        'bg-text-on-dark/10 font-semibold text-text-on-dark',
                        "before:absolute before:w-[3px] before:rounded-full before:bg-accent-sidebar before:content-['']",
                        item.sub
                          ? 'before:top-3xs before:bottom-3xs before:left-s'
                          : 'before:top-2xs before:bottom-2xs before:left-0',
                      )
                    : item.sub
                      ? 'text-text-on-dark-muted/60 hover:text-text-on-dark'
                      : 'text-text-on-dark-muted hover:bg-text-on-dark/5 hover:text-text-on-dark',
                )}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="ml-auto min-w-[20px] rounded-full bg-fill-danger px-2xs py-4xs text-center text-label leading-4 font-control text-text-on-dark">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  const account = (
    <div className="border-t border-text-on-dark/10 px-s py-m">
      <p className="m-0 mb-xs truncate px-3xs text-body-sm text-text-on-dark-muted/50">
        {accountName}
      </p>
      <button
        type="button"
        onClick={onLogout}
        className={cn(
          'flex w-full cursor-pointer items-center gap-xs rounded-md border-0 bg-transparent px-s py-xs text-left text-body text-text-on-dark-muted transition-colors hover:bg-text-on-dark/5 hover:text-text-on-dark',
          focusRingClassName,
        )}
      >
        {/* A door with an arrow leaving it, drawn here so the registry needs no icon set. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-m shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
        Log out
      </button>
    </div>
  );

  const heading = (
    <>
      <p className="m-0 text-body font-black tracking-widest text-text-on-dark uppercase">
        {title}
      </p>
      <p className="m-0 mt-4xs text-body-sm text-text-on-dark-muted/50">{subtitle}</p>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-border-sidebar bg-surface-sidebar text-text-on-dark md:flex">
        <div className="border-b border-text-on-dark/10 px-m py-ml">{heading}</div>
        {links}
        {account}
      </aside>

      <details className="group border-b border-border-sidebar bg-surface-sidebar text-text-on-dark md:hidden">
        <summary
          className={cn(
            'flex cursor-pointer list-none items-center justify-between gap-m px-m py-s [&::-webkit-details-marker]:hidden',
            focusRingClassName,
          )}
        >
          <span>{heading}</span>
          <span className="text-label font-control tracking-widest text-text-on-dark-muted uppercase">
            <span className="group-open:hidden">Menu</span>
            <span className="hidden group-open:inline">Close</span>
          </span>
        </summary>
        <span ref={dismissAnchor} hidden />
        <div className="flex max-h-[75vh] flex-col border-t border-text-on-dark/10">
          {links}
          {account}
        </div>
      </details>

      <main className="min-w-0 flex-grow overflow-x-hidden">{children}</main>
    </div>
  );
}
