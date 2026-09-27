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
  /**
   * Which end of the row the brand block sits at. The wide track follows it,
   * so `end` is a mirror rather than a narrow column at the right.
   *
   * A closed pair rather than a number: the link columns already position
   * themselves by their order in `columns`, so the only thing that could not
   * be moved was the brand, and an arbitrary index would let a caller drop it
   * mid-row where the wide track cannot follow.
   */
  brandPosition?: 'start' | 'end';
  columns: FooterColumn[];
  /** The bottom bar: copyright, registration numbers, credits. */
  legal: ReactNode;
  /**
   * Painted behind everything, inside the footer's own stacking context. The
   * content sits at `z-1` above it. Position it yourself — it is handed the
   * whole footer box.
   */
  backdrop?: ReactNode;
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

/** The same tracks mirrored, for `brandPosition="end"`. */
const COLUMN_GRID_BRAND_END: Record<number, string> = {
  1: 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]',
  2: 'lg:grid-cols-[repeat(2,minmax(0,1fr))_minmax(0,1.4fr)]',
  3: 'lg:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.4fr)]',
  4: 'lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.4fr)]',
  5: 'lg:grid-cols-[repeat(5,minmax(0,1fr))_minmax(0,1.4fr)]',
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

export function SiteFooter({
  brand,
  brandPosition = 'start',
  columns,
  legal,
  backdrop,
}: SiteFooterProps) {
  const grid = brandPosition === 'end' ? COLUMN_GRID_BRAND_END : COLUMN_GRID;
  /* Spans the pair of columns at `sm`, then takes the wide track. */
  const brandBlock = <div className="sm:col-span-full lg:col-auto">{brand}</div>;
  const linkBlocks = columns.map((column) => (
    <div key={column.label} className="flex flex-col gap-0 text-body-sm lg:gap-s">
      <div className="mb-xs">
        <Eyebrow size="sm" tone="muted">
          {column.label}
        </Eyebrow>
      </div>
      {column.links?.map((link) => (
        <FooterRow key={link.href} {...link} />
      ))}
      {column.children}
    </div>
  ));

  return (
    <footer className="relative overflow-hidden bg-surface-page pt-section pb-l text-text-primary">
      {backdrop}
      <div
        className={cn(
          'site-shell relative z-1 grid grid-cols-[minmax(0,1fr)] gap-2xl sm:grid-cols-2',
          grid[columns.length] ?? grid[4],
        )}
      >
        {brandPosition === 'end' ? (
          <>
            {linkBlocks}
            {brandBlock}
          </>
        ) : (
          <>
            {brandBlock}
            {linkBlocks}
          </>
        )}
      </div>
      <div className="site-shell relative z-1 mt-3xl flex flex-col items-start justify-between gap-xs border-t border-border-default pt-ml text-label text-text-muted lg:flex-row lg:items-center lg:gap-0">
        {legal}
      </div>
    </footer>
  );
}
