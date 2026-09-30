/* Component registry: freetheplatform/frontend/registry/src/components/layout/MobileNavPanel.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import Link from 'next/link';
import type { ReactNode } from 'react';

import { NavPanelDismiss } from '@/components/layout/NavPanelDismiss';
import { mobileNavRowClassName, type NavItem } from '@/components/layout/navigation';
import { focusRingClassName } from '@/lib/controlState';
import { cn } from '@/lib/utils';

const BAR = 'h-[2px] w-[19px] bg-text-primary transition-[transform,opacity] duration-200';

/**
 * The hamburger panel below the `nav` breakpoint, dropdown entries flattened into rows.
 * A native `<details>`, not React state: it works without JavaScript, announces its own state, and leaves the tab order when closed.
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
        className={cn(
          'flex size-[var(--tap-min)] cursor-pointer list-none flex-col items-center justify-center gap-3xs [&::-webkit-details-marker]:hidden',
          focusRingClassName,
        )}
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
