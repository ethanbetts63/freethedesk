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
  /**
   * The single nav source. Desktop renders each entry as a link, or as a
   * dropdown where `items` is present; the mobile panel flattens the same
   * array. Writing the tree twice is how the two menus drift apart.
   */
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
  /**
   * Frosted rather than solid. An appearance choice rather than drift: the
   * translucent header is load-bearing for the site that has one, and making
   * every site solid to avoid the prop is a bigger change than the prop.
   */
  translucent?: boolean;
  linkStyle?: NavLinkStyle;
  className?: string;
}

/**
 * The site header: sticky chrome, one nav source, a desktop row above the
 * `nav` breakpoint and a hamburger panel below it.
 *
 * A Server Component. The only client code beneath it is the dropdown's touch
 * toggle and the mobile panel's dismiss controller, so the nav markup itself
 * never reaches the bundle.
 *
 * Height comes from `--header-height` / `--header-height-lg`, which each site
 * sets. A site that wants a taller header changes a token, not this file.
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
  className,
}: SiteHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-border-default',
        translucent
          ? 'bg-[color-mix(in_srgb,var(--surface-page)_92%,transparent)] backdrop-blur-[14px]'
          : 'bg-surface-page',
        className,
      )}
    >
      {banner}

      {/* Full viewport width with the shared gutter, not the content shell:
          the header is chrome, and pinning the logo and actions to the
          viewport edges is what separates it from the column of content. */}
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
