/* Component registry: freetheplatform/frontend/registry/src/components/layout/SiteHeader.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import Link from 'next/link';
import type { ReactNode } from 'react';

import DesktopNavMenu from '@/components/layout/DesktopNavMenu';
import { MobileNavPanel } from '@/components/layout/MobileNavPanel';
import { NAV_LINK, type NavItem, type NavLinkStyle } from '@/components/layout/navigation';
import { cn } from '@/lib/utils';

interface SiteHeaderProps {
  /** Logo, wordmark, or both — already wrapped in its own home link. */
  logo: ReactNode;
  /** The single nav source: desktop renders links and dropdowns, the mobile panel flattens the same array. */
  items: readonly NavItem[];
  /** Filled CTA at the end of the desktop row. Apply `navCtaClassName`. */
  cta?: ReactNode;
  /** The same CTA for the mobile panel, where it needs `mobileNavCtaClassName`. */
  mobileCta?: ReactNode;
  /** Desktop-only extras after the CTA — a contact block, an account menu. */
  actions?: ReactNode;
  /** Extra rows at the foot of the mobile panel. */
  mobileExtra?: ReactNode;
  /** Announcement strip above the nav row, inside the sticky container. */
  banner?: ReactNode;
  /** Frosted rather than solid; load-bearing for the site that has one. */
  translucent?: boolean;
  linkStyle?: NavLinkStyle;
}

/**
 * Sticky header: a desktop row above the `nav` breakpoint, a hamburger panel below it.
 * A Server Component; height comes from each site's `--header-height` / `--header-height-lg`.
 */
export function SiteHeader({
  logo,
  items,
  cta,
  mobileCta,
  actions,
  mobileExtra,
  banner,
  translucent = false,
  linkStyle = 'label',
}: SiteHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-border-default',
        translucent
          ? 'bg-[color-mix(in_srgb,var(--surface-page)_92%,transparent)] backdrop-blur-[14px]'
          : 'bg-surface-page',
      )}
    >
      {banner}

      {/* Full viewport width with the gutter, not the content shell: the header is chrome. */}
      {/* eslint-disable-next-line no-restricted-syntax -- --header-height and --gutter are named tokens; var() references are not one-off values */}
      <div className="flex min-h-[var(--header-height)] w-full items-center justify-between gap-l px-[var(--gutter)] lg:min-h-[var(--header-height-lg)]">
        {logo}

        <nav
          className="nav:flex hidden items-center gap-l self-stretch"
          aria-label="Primary navigation"
        >
          {items.map((item) =>
            item.items ? (
              <DesktopNavMenu
                key={item.href}
                label={item.label}
                items={item.items}
                linkStyle={linkStyle}
              />
            ) : (
              <Link key={item.href} href={item.href} className={NAV_LINK[linkStyle]}>
                {item.label}
              </Link>
            ),
          )}
          {cta}
          {actions}
        </nav>

        <MobileNavPanel items={items} cta={mobileCta ?? cta}>
          {mobileExtra}
        </MobileNavPanel>
      </div>
    </header>
  );
}
