/* Component registry: freetheplatform/frontend/registry/src/components/layout/MobileNavPanel.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import Link from 'next/link';
import type { ReactNode } from 'react';

import { NavPanelDismiss } from '@/components/layout/NavPanelDismiss';
import { mobileNavRowClassName, type NavItem } from '@/components/layout/navigation';
import { cn } from '@/lib/utils';

const BAR = 'h-[2px] w-[19px] bg-text-primary transition-[transform,opacity] duration-200';

/**
 * The hamburger panel, below the `nav` breakpoint.
 *
 * A native `<details>` rather than React state: it works with JavaScript off,
 * it announces its own expanded/collapsed state, and its contents are properly
 * hidden from the tab order while closed — which a `max-height: 0` panel is
 * not.
 *
 * Dropdown entries are flattened: the desktop menu's destinations become rows
 * here rather than a nested menu.
 */
export function MobileNavPanel({
  items,
  cta,
  children,
}: {
  items: readonly NavItem[];
  /** The last row. Apply `mobileNavCtaClassName` to it so the fill is the tap target. */
  cta?: ReactNode;
  /** Extra rows below the CTA — role-specific links, a log-out control. */
  children?: ReactNode;
}) {
  const rows = items.flatMap((item) => (item.items ? [...item.items] : [item]));

  return (
    <details className="group nav:hidden relative block">
      <summary
        className="flex h-[44px] w-[44px] cursor-pointer list-none flex-col items-center justify-center gap-3xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-primary [&::-webkit-details-marker]:hidden"
        aria-label="Navigation menu"
      >
        <i className={cn(BAR, 'group-open:translate-y-[7px] group-open:rotate-45')} />
        <i className={cn(BAR, 'group-open:opacity-0')} />
        <i className={cn(BAR, 'group-open:-translate-y-[7px] group-open:-rotate-45')} />
      </summary>
      <nav
        className="absolute top-[calc(100%+12px)] right-0 z-50 flex w-[min(330px,calc(100vw-40px))] flex-col border border-border-default bg-surface-page p-xs shadow-xl"
        aria-label="Mobile navigation"
      >
        {rows.map((row) => (
          <Link className={mobileNavRowClassName} key={row.href} href={row.href}>
            {row.label}
            <span aria-hidden="true" className="text-text-action">
              &rarr;
            </span>
          </Link>
        ))}
        {cta}
        {children}
      </nav>
      <NavPanelDismiss />
    </details>
  );
}
