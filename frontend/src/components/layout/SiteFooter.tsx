/* Component registry: freetheplatform/frontend/registry/src/components/layout/SiteFooter.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import Link from 'next/link';
import type { ReactNode } from 'react';

import Eyebrow from '@/components/common/eyebrow';
import { cn } from '@/lib/utils';

export interface FooterLink {
  href: string;
  label: ReactNode;
  /** Renders an `<a>` rather than a `<Link>`. Use for mailto:, tel: and offsite. */
  external?: boolean;
}

export interface FooterColumn {
  label: string;
  links?: FooterLink[];
  /** Non-link rows — an address, opening hours — rendered under the same label. */
  children?: ReactNode;
}

interface SiteFooterProps {
  /** Logo, wordmark and any standing copy. Takes the widest track. */
  brand: ReactNode;
  columns: FooterColumn[];
  /** The bottom bar: copyright, registration numbers, credits. */
  legal: ReactNode;
  /**
   * Painted behind everything, inside the footer's own stacking context. The
   * content sits at `z-1` above it. Position it yourself — it is handed the
   * whole footer box.
   */
  backdrop?: ReactNode;
  className?: string;
}

/**
 * Column tracks by column count. Written out rather than computed because
 * Tailwind only sees class names that appear literally in source; the brand
 * block always takes the wide track.
 */
const COLUMN_GRID: Record<number, string> = {
  1: 'lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]',
  2: 'lg:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))]',
  3: 'lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]',
  4: 'lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]',
  5: 'lg:grid-cols-[minmax(0,1.4fr)_repeat(5,minmax(0,1fr))]',
};

/**
 * Footer rows are ~19px tall, too small to tap reliably, so on narrow screens
 * each is widened to the tap minimum rather than enlarged — that keeps the
 * visual weight while giving the finger a target. From `lg` they go back to
 * inline text. `overflow-wrap` is for email addresses, single unbreakable
 * tokens wider than their column.
 */
const rowClassName =
  'flex min-h-[var(--tap-min)] items-center [overflow-wrap:anywhere] text-text-muted lg:inline lg:min-h-0';

/**
 * `prefetch={false}` on every footer link.
 *
 * The footer sits in the root layout, so it renders on every page, and App
 * Router `<Link>` prefetches each destination as it scrolls into view. That
 * means an RSC request per footer link on every page view — twenty-odd fetches
 * for pages the visitor is unlikely to open. Footer navigation is infrequent
 * and deliberate, so it can afford to load on click.
 */
function FooterRow({ href, label, external }: FooterLink) {
  const className = cn(rowClassName, 'transition-colors hover:text-text-action');
  if (external) {
    return (
      <a className={className} href={href}>
        {label}
      </a>
    );
  }
  return (
    <Link className={className} href={href} prefetch={false}>
      {label}
    </Link>
  );
}

export function SiteFooter({ brand, columns, legal, backdrop, className }: SiteFooterProps) {
  return (
    <footer
      className={cn(
        'relative overflow-hidden bg-surface-page pt-section pb-l text-text-primary',
        className,
      )}
    >
      {backdrop}
      <div
        className={cn(
          'site-shell relative z-1 grid grid-cols-[minmax(0,1fr)] gap-2xl sm:grid-cols-2',
          COLUMN_GRID[columns.length] ?? COLUMN_GRID[4],
        )}
      >
        {/* Spans the pair of columns at `sm`, then takes the wide track. */}
        <div className="sm:col-span-full lg:col-auto">{brand}</div>
        {columns.map((column) => (
          <div key={column.label} className="flex flex-col gap-0 text-body-sm lg:gap-s">
            <Eyebrow size="sm" tone="muted" className="mb-xs">
              {column.label}
            </Eyebrow>
            {column.links?.map((link) => (
              <FooterRow key={link.href} {...link} />
            ))}
            {column.children}
          </div>
        ))}
      </div>
      <div className="site-shell relative z-1 mt-3xl flex flex-col items-start justify-between gap-xs border-t border-border-default pt-ml text-caption-sm text-text-muted lg:flex-row lg:items-center lg:gap-0">
        {legal}
      </div>
    </footer>
  );
}
