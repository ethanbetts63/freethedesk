'use client';

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';

import { focusRingClassName } from '@/lib/controlState';
import { cn } from '@/lib/utils';

import { ChartCard } from './ChartCard';
import { formatCompact, formatExact, monthLabel, niceTicks, type ValueFormat } from './format';

export interface ChartLine {
  key: string;
  label: string;
  values: number[];
  /** 1-8: the categorical slot, fixed per entity. Omit for the total, which is drawn in ink. */
  slot?: number;
}

const SLOT_STROKE: Record<number, string> = {
  1: 'var(--chart-series-1)',
  2: 'var(--chart-series-2)',
  3: 'var(--chart-series-3)',
  4: 'var(--chart-series-4)',
  5: 'var(--chart-series-5)',
  6: 'var(--chart-series-6)',
  7: 'var(--chart-series-7)',
  8: 'var(--chart-series-8)',
};
const strokeFor = (line: ChartLine) =>
  line.slot ? (SLOT_STROKE[line.slot] ?? SLOT_STROKE[8]) : 'var(--chart-total)';

const HEIGHT = 240;
const PAD = { top: 16, right: 56, bottom: 28, left: 52 };

/** Width of the element, kept current, so the SVG draws at real pixels and its text never scales. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/**
 * A monthly line chart, from allbikes' admin statistics: one axis, 2px lines, a
 * crosshair tooltip that reads every line at the hovered month, and a table view.
 * Lines can be hidden from the legend; a hidden line keeps its colour when it comes
 * back.
 */
export function LineChart({
  title,
  description,
  months,
  lines,
  format = 'count',
  emptyMessage = 'Nothing recorded yet.',
}: {
  title: string;
  description?: string;
  months: string[];
  lines: ChartLine[];
  format?: ValueFormat;
  emptyMessage?: string;
}) {
  const [containerRef, width] = useWidth<HTMLDivElement>();
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<number | null>(null);
  const tooltipId = useId();

  const shown = lines.filter((line) => !hidden.has(line.key));
  const empty = lines.every((line) => line.values.every((value) => value === 0));

  const plotWidth = Math.max(width - PAD.left - PAD.right, 0);
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;
  const max = Math.max(0, ...shown.flatMap((line) => line.values));
  const ticks = useMemo(() => niceTicks(max, 4, format === 'count'), [max, format]);
  const top = ticks[ticks.length - 1] || 1;

  const x = (index: number) =>
    PAD.left + (months.length > 1 ? (index / (months.length - 1)) * plotWidth : plotWidth / 2);
  const y = (value: number) => PAD.top + plotHeight - (value / top) * plotHeight;

  // At most one month label per ~64px, always including the last month.
  const labelEvery = Math.max(
    1,
    Math.ceil(months.length / Math.max(1, Math.floor(plotWidth / 64))),
  );
  const xLabels = months
    .map((month, index) => ({ month, index }))
    .filter(({ index }) => (months.length - 1 - index) % labelEvery === 0);

  // End labels only when there are few lines, and only where they will not collide.
  const endLabels = useMemo(() => {
    if (shown.length > 4 || months.length === 0) return [];
    const last = months.length - 1;
    const placed: { key: string; y: number; text: string }[] = [];
    for (const line of shown) {
      const lineY = y(line.values[last] ?? 0);
      if (placed.every((placedLabel) => Math.abs(placedLabel.y - lineY) >= 14)) {
        placed.push({
          key: line.key,
          y: lineY,
          text: formatCompact(line.values[last] ?? 0, format),
        });
      }
    }
    return placed;
    // y depends on top and plotHeight, both derived from shown.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, months.length, top, plotHeight, format]);

  const nearest = (clientX: number, rect: DOMRect) => {
    if (months.length <= 1) return 0;
    const ratio = (clientX - rect.left - PAD.left) / plotWidth;
    return Math.min(months.length - 1, Math.max(0, Math.round(ratio * (months.length - 1))));
  };

  const onPointerMove = (event: PointerEvent<SVGRectElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (svg) setActive(nearest(event.clientX, svg.getBoundingClientRect()));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const step = event.key === 'ArrowRight' ? 1 : -1;
      setActive((current) =>
        Math.min(months.length - 1, Math.max(0, (current ?? months.length - 1) + step)),
      );
    }
    if (event.key === 'Escape') setActive(null);
  };

  const toggle = (key: string) =>
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else if (lines.length - next.size > 1) next.add(key);
      return next;
    });

  const tooltipLeft = active === null ? 0 : x(active);
  const tooltipOnLeft = active !== null && tooltipLeft > width * 0.6;

  return (
    <ChartCard
      title={title}
      description={description}
      table={
        empty
          ? undefined
          : {
              columns: lines.map((line) => line.label),
              rows: months.map((month, index) => ({
                label: monthLabel(month, true),
                cells: lines.map((line) => formatExact(line.values[index] ?? 0, format)),
              })),
            }
      }
    >
      {/* A named status keeps its legend even alone; a single unnamed measure is named by the title. */}
      {!empty && (lines.length > 1 || lines[0]?.slot !== undefined) && (
        <ul
          className="m-0 mb-s flex list-none flex-wrap gap-x-m gap-y-2xs p-0"
          aria-label={`${title} lines`}
        >
          {lines.map((line) => {
            const off = hidden.has(line.key);
            return (
              <li key={line.key}>
                <button
                  type="button"
                  onClick={() => toggle(line.key)}
                  aria-pressed={!off}
                  className={cn(
                    'flex cursor-pointer items-center gap-2xs rounded-sm border-0 bg-transparent p-0 text-body-sm text-text-secondary hover:text-text-primary',
                    focusRingClassName,
                    off && 'opacity-40',
                  )}
                >
                  <svg width="16" height="4" aria-hidden="true">
                    <line
                      x1="1"
                      y1="2"
                      x2="15"
                      y2="2"
                      stroke={strokeFor(line)}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  {line.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div
        ref={containerRef}
        className={cn('relative', focusRingClassName)}
        tabIndex={empty ? -1 : 0}
        role="group"
        aria-label={`${title}. Use the left and right arrow keys to read each month.`}
        aria-describedby={active !== null ? tooltipId : undefined}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
      >
        {empty ? (
          <p className="m-0 flex min-h-[240px] items-center justify-center text-body-sm text-text-muted">
            {emptyMessage}
          </p>
        ) : (
          width > 0 && (
            <svg
              width={width}
              height={HEIGHT}
              role="img"
              aria-label={title}
              className="block overflow-visible"
            >
              {ticks.map((tick) => (
                <g key={tick}>
                  <line
                    x1={PAD.left}
                    x2={PAD.left + plotWidth}
                    y1={y(tick)}
                    y2={y(tick)}
                    stroke="var(--chart-grid)"
                    strokeWidth="1"
                  />
                  <text
                    x={PAD.left - 8}
                    y={y(tick)}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="fill-current text-label text-text-muted tabular-nums"
                  >
                    {formatCompact(tick, format)}
                  </text>
                </g>
              ))}

              {xLabels.map(({ month, index }) => (
                <text
                  key={month}
                  x={x(index)}
                  y={HEIGHT - 8}
                  textAnchor={
                    months.length === 1
                      ? 'middle'
                      : index === 0
                        ? 'start'
                        : index === months.length - 1
                          ? 'end'
                          : 'middle'
                  }
                  className="fill-current text-label text-text-muted"
                >
                  {monthLabel(month)}
                </text>
              ))}

              {active !== null && (
                <line
                  x1={x(active)}
                  x2={x(active)}
                  y1={PAD.top}
                  y2={PAD.top + plotHeight}
                  stroke="var(--chart-total)"
                  strokeOpacity="0.35"
                  strokeWidth="1"
                />
              )}

              {/* The total is drawn last so it sits over the status lines it sums. */}
              {[...shown.filter((line) => line.slot), ...shown.filter((line) => !line.slot)].map(
                (line) => (
                  <g key={line.key}>
                    {months.length > 1 && (
                      <polyline
                        points={line.values
                          .map((value, index) => `${x(index)},${y(value)}`)
                          .join(' ')}
                        fill="none"
                        stroke={strokeFor(line)}
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    )}
                    {(active !== null || months.length === 1) && (
                      <circle
                        cx={x(active ?? 0)}
                        cy={y(line.values[active ?? 0] ?? 0)}
                        r="4"
                        fill={strokeFor(line)}
                        stroke="var(--surface-page)"
                        strokeWidth="2"
                      />
                    )}
                  </g>
                ),
              )}

              {endLabels.map((label) => (
                <text
                  key={label.key}
                  x={x(months.length - 1) + 8}
                  y={label.y}
                  dominantBaseline="middle"
                  className="fill-current text-label font-strong text-text-secondary tabular-nums"
                >
                  {label.text}
                </text>
              ))}

              <rect
                x={PAD.left - 8}
                y={PAD.top}
                width={plotWidth + 16}
                height={plotHeight}
                fill="transparent"
                onPointerMove={onPointerMove}
                onPointerLeave={() => setActive(null)}
              />
            </svg>
          )
        )}

        {active !== null && !empty && (
          <div
            id={tooltipId}
            role="status"
            className={cn(
              'pointer-events-none absolute top-s z-10 min-w-[176px] rounded-md border border-border-default bg-surface-page px-s py-xs shadow-l',
              tooltipOnLeft && '-translate-x-full',
            )}
            style={{ left: tooltipOnLeft ? tooltipLeft - 12 : tooltipLeft + 12 }}
          >
            <p className="m-0 mb-4xs text-label font-strong tracking-label text-text-muted uppercase">
              {monthLabel(months[active], true)}
            </p>
            <ul className="m-0 flex list-none flex-col gap-4xs p-0">
              {shown.map((line) => (
                <li key={line.key} className="flex items-center gap-xs text-body-sm">
                  <svg width="12" height="4" aria-hidden="true">
                    <line
                      x1="1"
                      y1="2"
                      x2="11"
                      y2="2"
                      stroke={strokeFor(line)}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="font-strong text-text-primary tabular-nums">
                    {formatExact(line.values[active] ?? 0, format)}
                  </span>
                  <span className="text-text-secondary">{line.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ChartCard>
  );
}
