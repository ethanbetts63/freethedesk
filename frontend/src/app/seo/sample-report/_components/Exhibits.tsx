import { cn } from '@/lib/utils';

import type { PairedRow } from '../_lib/report';
import { display } from './ReportPrimitives';

/** A chart's heading and its window line, as every exhibit in the report carries them. */
export function Exhibit({
  caption,
  window,
  children,
}: {
  caption: string;
  window?: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="m-0 my-m">
      <figcaption className="mb-xs">
        <span
          className={cn(display, 'block text-body leading-snug font-strong text-text-secondary')}
        >
          {caption}
        </span>
        {window && (
          <span className={cn(display, 'mt-4xs block text-body-sm leading-snug text-text-subtle')}>
            {window}
          </span>
        )}
      </figcaption>
      {children}
    </figure>
  );
}

/**
 * This period against the one before, one pair of bars per row: dark blue now,
 * light blue before, in every chart, so the comparison reads without a key.
 * Plain HTML rather than SVG, so the labels stay legible at any width.
 */
export function PairedBars({
  rows,
  nowLabel,
  beforeLabel,
  valueTitle,
}: {
  rows: readonly PairedRow[];
  nowLabel: string;
  beforeLabel: string;
  valueTitle: string;
}) {
  const max = Math.max(...rows.flatMap((row) => [row.now, row.before]));
  // Room is left after the longest bar for its value.
  const width = (value: number) => ({ width: `calc((100% - 2.5rem) * ${value / max})` });

  return (
    <div className={display}>
      <ul className="m-0 mb-s flex list-none flex-wrap gap-x-m p-0 text-body-sm text-text-secondary">
        <li className="flex items-center gap-2xs">
          <span aria-hidden="true" className="size-s bg-action-primary" />
          {nowLabel}
        </li>
        <li className="flex items-center gap-2xs">
          <span aria-hidden="true" className="size-s bg-surface-accent-soft" />
          {beforeLabel}
        </li>
      </ul>
      <dl className="m-0 grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] items-center gap-x-s gap-y-xs sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)]">
        {rows.map((row) => (
          <div key={row.label} className="contents">
            <dt className="text-right text-body-sm leading-tight text-text-muted">{row.label}</dt>
            <dd className="m-0 flex flex-col gap-4xs">
              <span className="flex items-center gap-2xs">
                <span className="h-s flex-none bg-action-primary" style={width(row.now)} />
                <span className="text-caption text-text-secondary tabular-nums">{row.now}</span>
              </span>
              <span className="flex items-center gap-2xs">
                <span className="h-s flex-none bg-surface-accent-soft" style={width(row.before)} />
                <span className="text-caption text-text-subtle tabular-nums">{row.before}</span>
              </span>
            </dd>
          </div>
        ))}
      </dl>
      <p className="m-0 mt-xs text-center text-body-sm font-semibold text-text-subtle">
        {valueTitle}
      </p>
    </div>
  );
}
