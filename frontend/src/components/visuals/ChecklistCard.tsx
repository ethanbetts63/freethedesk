import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { hiddenBelowSmClassName, stepBadgeClassName } from './chrome';

export type ChecklistItem = {
  title: string;
  description?: string;
  tag?: string;
};

type ChecklistCardProps = {
  /** The header's leading mark: a live status dot, a logo, a glyph. */
  mark?: ReactNode;
  eyebrow: string;
  title: string;
  countLabel: string;
  items: readonly ChecklistItem[];
  /** A band across the bottom. Only the framed layout has room for one. */
  footer?: ReactNode;
  layout?: 'panel' | 'framed';
  className?: string;
  ariaLabel?: string;
};

/**
 * A numbered checklist inside an animated-border card: a mark, a heading, a
 * gradient count, and one row per item — index, tick, copy, tag.
 *
 * This was two components (`StatusPanelVisual` and the Google Business Profile
 * audit card) that agreed about the row exactly and disagreed only about how
 * the card is dressed. Those two dressings are the two layouts:
 *
 *   panel  — the card is the padding, the header is a ruled line, and each row
 *            is a tinted card of its own with air between them.
 *   framed — the header and footer are their own bands, and the rows are a
 *            list separated by hairlines. Denser; carries six rows.
 *
 * The third member of the family, `ReportCardVisual`, keeps its own row: its
 * badges are squares, its type is a size up, and its rows indent on hover.
 */
export function ChecklistCard({
  mark,
  eyebrow,
  title,
  countLabel,
  items,
  footer,
  layout = 'panel',
  className,
  ariaLabel,
}: ChecklistCardProps) {
  const framed = layout === 'framed';
  return (
    <div
      className={cn(
        'moving-colour-border mx-auto w-full min-w-0 lg:mx-0 lg:w-auto lg:max-w-none',
        framed
          ? 'max-w-[660px] self-center text-text-primary'
          : 'max-w-[620px] p-xl text-text-secondary',
        className,
      )}
      aria-label={ariaLabel}
    >
      <header
        className={cn(
          'flex items-center justify-between gap-s',
          framed
            ? 'items-start border-b border-border-default bg-surface-tint px-ml py-m sm:items-center sm:gap-0'
            : 'border-b border-border-subtle pb-m',
        )}
      >
        <div className="flex items-center gap-s">
          {mark}
          <span>
            <small className="mb-4xs block text-caption font-black tracking-label text-text-muted uppercase">
              {eyebrow}
            </small>
            <strong className="block text-body-sm">{title}</strong>
          </span>
        </div>
        <span className="moving-colour-text text-label font-black uppercase">{countLabel}</span>
      </header>

      <ol className={cn('m-0 list-none p-0', framed ? 'px-ml' : 'grid gap-s pt-xl')}>
        {items.map((item, index) => (
          <li
            key={item.title}
            className={cn(
              'grid grid-cols-[22px_26px_minmax(0,1fr)] items-center gap-s sm:grid-cols-[24px_26px_minmax(0,1fr)_auto]',
              framed
                ? 'border-b border-border-subtle py-m'
                : 'border border-border-subtle bg-surface-tint px-s py-m',
            )}
          >
            <span className="text-label font-black text-text-subtle">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span
              className={cn(
                stepBadgeClassName,
                'h-[26px] w-[26px] bg-surface-tint-strong text-label font-black text-action-primary',
              )}
              aria-hidden="true"
            >
              ✓
            </span>
            <span>
              <strong className="block text-body-sm">{item.title}</strong>
              {item.description ? (
                <small className="mt-4xs block text-label leading-[1.4] text-text-muted">
                  {item.description}
                </small>
              ) : null}
            </span>
            {item.tag ? (
              <span
                className={cn(
                  hiddenBelowSmClassName,
                  'text-caption font-black tracking-label-tight text-text-muted uppercase',
                )}
              >
                {item.tag}
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      {footer}
    </div>
  );
}

/** The header mark on a panel: a live dot haloed in a tint of its own colour. */
export function LiveDot() {
  return (
    <span
      className="h-[9px] w-[9px] flex-none rounded-circle bg-fill-success shadow-halo [--ring-halo-colour:var(--fill-success)]"
      aria-hidden="true"
    />
  );
}
