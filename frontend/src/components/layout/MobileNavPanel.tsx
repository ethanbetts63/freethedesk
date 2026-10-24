/* Component registry: freetheplatform/frontend/registry/src/components/layout/MobileNavPanel.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import Link from 'next/link';
import type { ReactNode } from 'react';

import { NavPanelDismiss } from '@/components/layout/NavPanelDismiss';
import {
  mobileNavRowClassName,
  mobileNavSubRowClassName,
  type NavItem,
} from '@/components/layout/navigation';
import { focusRingClassName } from '@/lib/controlState';
import { cn } from '@/lib/utils';

/* Open, the outer bars slide 6px onto the middle one and turn into an X. 6px is the bar height plus `gap-3xs`:
   any other distance and the two strokes cross off-centre. */
const BAR = 'h-[2px] w-[19px] bg-text-primary transition-[transform,opacity] duration-200';

/** Shared by every section's `<details>`, which makes them an exclusive accordion: opening one closes the rest. */
const SECTION_GROUP = 'mobile-nav-section';

/**
 * The full-screen hamburger menu below the `nav` breakpoint. A desktop dropdown becomes a section that expands
 * in place, one open at a time.
 * Native `<details>` throughout, not React state: it works without JavaScript, announces its own state, and leaves
 * the tab order when closed. The panel hangs off the sticky header, so `100%` is the header's height, banner included.
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
  return (
    <details className="group/menu nav:hidden block">
      <summary
        className={cn(
          'flex size-[var(--tap-min)] cursor-pointer list-none flex-col items-center justify-center gap-3xs [&::-webkit-details-marker]:hidden',
          focusRingClassName,
        )}
        aria-label="Navigation menu"
      >
        <i className={cn(BAR, 'group-open/menu:translate-y-[6px] group-open/menu:rotate-45')} />
        <i className={cn(BAR, 'group-open/menu:opacity-0')} />
        <i className={cn(BAR, 'group-open/menu:-translate-y-[6px] group-open/menu:-rotate-45')} />
      </summary>
      <nav
        // eslint-disable-next-line no-restricted-syntax -- --gutter is a named token; 100dvh-100% is the viewport below the header
        className="absolute inset-x-0 top-full z-50 flex h-[calc(100dvh-100%)] flex-col overflow-y-auto overscroll-contain bg-surface-page px-[var(--gutter)] pt-xs pb-l"
        aria-label="Mobile navigation"
      >
        {items.map((item) =>
          item.items ? (
            <details
              key={item.href}
              name={SECTION_GROUP}
              className="group/section border-b border-border-default"
            >
              <summary
                className={cn(
                  mobileNavRowClassName,
                  'cursor-pointer list-none border-b-0 [&::-webkit-details-marker]:hidden',
                )}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className="h-0 w-0 flex-none border-x-[6px] border-t-[7px] border-x-transparent border-t-action-primary transition-transform duration-200 group-open/section:rotate-180 motion-reduce:transition-none"
                />
              </summary>
              <div className="flex flex-col pb-xs">
                {item.items.map((sub) => (
                  <Link className={mobileNavSubRowClassName} key={sub.href} href={sub.href}>
                    {sub.label}
                  </Link>
                ))}
              </div>
            </details>
          ) : (
            <Link className={mobileNavRowClassName} key={item.href} href={item.href}>
              {item.label}
              <span aria-hidden="true" className="text-text-action">
                &rarr;
              </span>
            </Link>
          ),
        )}
        {cta}
        {children}
      </nav>
      <NavPanelDismiss />
    </details>
  );
}
