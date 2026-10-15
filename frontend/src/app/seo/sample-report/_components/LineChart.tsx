import { cn } from '@/lib/utils';

import { display } from './ReportPrimitives';

/**
 * The report's line chart, drawn as inline SVG in the house colours: blue is
 * this experiment or this period, grey is the comparison, purple the second
 * measure. The renderer draws these with Vega; this reproduces its look
 * (dotted grid, axis titles, the shaded reporting period, the dashed goal and
 * the "Shipped" rule) without shipping a chart library for one page.
 *
 * SVG text scales with the drawing, so each chart is drawn twice, at a wide
 * and a narrow viewBox, and the breakpoint shows one: a single wide drawing
 * shrank its labels to a few pixels on a phone.
 */

export type Tone = 'now' | 'compare' | 'second' | 'soft';

/** Complete class strings, one per tone (Tailwind only sees literal names). */
const toneClass: Record<Tone, string> = {
  now: 'text-action-primary',
  compare: 'text-text-subtle',
  second: 'text-[var(--purple-accent)]',
  soft: 'text-surface-accent-soft',
};

export type LineSeries = {
  label: string;
  values: readonly number[];
  tone: Tone;
  axis?: 'left' | 'right';
  dots?: boolean;
};

export type Axis = { min: number; max: number; ticks: readonly number[]; title?: string };

export type LineChartProps = {
  ariaLabel: string;
  series: readonly LineSeries[];
  /** Where each x label sits, as an index into the series. */
  xLabels: readonly { at: number; label: string }[];
  /** Fewer labels for the narrow drawing, when the wide set would collide. */
  xLabelsNarrow?: readonly { at: number; label: string }[];
  xTitle?: string;
  left: Axis;
  right?: Axis;
  /** Ranked axes run downwards: first place at the top. */
  invert?: boolean;
  shade?: { from: number; to: number; label: string };
  marker?: { at: number; label: string };
  goal?: { value: number; label: string };
};

type Frame = { width: number; height: number; font: number };

const WIDE: Frame = { width: 760, height: 280, font: 11 };
const NARROW: Frame = { width: 300, height: 220, font: 11 };

function Drawing({ frame, props }: { frame: Frame; props: LineChartProps }) {
  const { width, height, font } = frame;
  const { series, left, right, invert, shade, marker, goal, xTitle } = props;
  const labels = frame === NARROW && props.xLabelsNarrow ? props.xLabelsNarrow : props.xLabels;
  const count = series[0]?.values.length ?? 0;

  const plotLeft = left.title ? 46 : 32;
  const plotRight = width - (right ? (right.title ? 50 : 38) : 10);
  const plotTop = 10;
  const plotBottom = height - (xTitle ? 40 : 24);

  const x = (index: number) =>
    plotLeft + (count <= 1 ? 0 : (index / (count - 1)) * (plotRight - plotLeft));
  const scale = (axis: Axis) => (value: number) => {
    const share = (value - axis.min) / (axis.max - axis.min);
    return invert
      ? plotTop + share * (plotBottom - plotTop)
      : plotBottom - share * (plotBottom - plotTop);
  };
  const yLeft = scale(left);
  const yRight = right ? scale(right) : yLeft;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="block h-auto w-full overflow-visible"
      role="img"
      aria-label={props.ariaLabel}
    >
      {shade && (
        <rect
          x={x(shade.from)}
          y={plotTop}
          width={x(shade.to) - x(shade.from)}
          height={plotBottom - plotTop}
          className="fill-surface-accent-soft/40"
        />
      )}

      <g className="text-border-default">
        {left.ticks.map((tick) => (
          <line
            key={tick}
            x1={plotLeft}
            x2={plotRight}
            y1={yLeft(tick)}
            y2={yLeft(tick)}
            stroke="currentColor"
            strokeDasharray="2 3"
          />
        ))}
        <line x1={plotLeft} x2={plotRight} y1={plotBottom} y2={plotBottom} stroke="currentColor" />
      </g>

      <g className="fill-current text-text-subtle" fontSize={font}>
        {left.ticks.map((tick) => (
          <text key={tick} x={plotLeft - 6} y={yLeft(tick) + 4} textAnchor="end">
            {tick.toLocaleString('en-AU')}
          </text>
        ))}
        {right?.ticks.map((tick) => (
          <text key={tick} x={plotRight + 6} y={yRight(tick) + 4} textAnchor="start">
            {tick.toLocaleString('en-AU')}
          </text>
        ))}
        {labels.map(({ at, label }) => (
          <text key={label} x={x(at)} y={plotBottom + 16} textAnchor="middle">
            {label}
          </text>
        ))}
      </g>

      <g className="fill-current text-text-subtle" fontSize={font} fontWeight={600}>
        {left.title && (
          <text
            transform={`translate(12 ${(plotTop + plotBottom) / 2}) rotate(-90)`}
            textAnchor="middle"
          >
            {left.title}
          </text>
        )}
        {right?.title && (
          <text
            transform={`translate(${width - 10} ${(plotTop + plotBottom) / 2}) rotate(90)`}
            textAnchor="middle"
          >
            {right.title}
          </text>
        )}
        {xTitle && (
          <text x={(plotLeft + plotRight) / 2} y={height - 6} textAnchor="middle">
            {xTitle}
          </text>
        )}
      </g>

      {goal && (
        <g className="text-text-success">
          <line
            x1={plotLeft}
            x2={plotRight}
            y1={yLeft(goal.value)}
            y2={yLeft(goal.value)}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="6 5"
          />
          <text
            x={plotRight}
            y={yLeft(goal.value) - 5}
            textAnchor="end"
            fontSize={font}
            className="fill-current"
          >
            {goal.label}
          </text>
        </g>
      )}

      {marker && (
        <g className="text-text-secondary">
          <line
            x1={x(marker.at)}
            x2={x(marker.at)}
            y1={plotTop}
            y2={plotBottom}
            stroke="currentColor"
            strokeWidth="1"
          />
          <text x={x(marker.at) + 4} y={plotBottom - 5} fontSize={font} className="fill-current">
            {marker.label}
          </text>
        </g>
      )}

      {series.map((line) => {
        const y = line.axis === 'right' ? yRight : yLeft;
        const points = line.values.map((value, index) => `${x(index)},${y(value)}`).join(' ');
        return (
          <g key={line.label} className={toneClass[line.tone]}>
            <polyline
              points={points}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {line.dots &&
              line.values.map((value, index) => (
                <circle key={index} cx={x(index)} cy={y(value)} r="2.8" fill="currentColor" />
              ))}
          </g>
        );
      })}
    </svg>
  );
}

function Legend({ series, shade }: Pick<LineChartProps, 'series' | 'shade'>) {
  return (
    <ul
      className={cn(
        display,
        'm-0 mb-xs flex list-none flex-wrap gap-x-m gap-y-3xs p-0 text-body-sm text-text-secondary',
      )}
    >
      {shade && (
        <li className="flex items-center gap-2xs">
          <span aria-hidden="true" className="size-s bg-surface-accent-soft/40" />
          {shade.label}
        </li>
      )}
      {series.map((line) => (
        <li key={line.label} className="flex items-center gap-2xs">
          <span
            aria-hidden="true"
            className={cn('h-4xs w-3 rounded-pill bg-current', toneClass[line.tone])}
          />
          {line.label}
        </li>
      ))}
    </ul>
  );
}

export function LineChart(props: LineChartProps) {
  return (
    <div className={display}>
      <Legend series={props.series} shade={props.shade} />
      <div className="hidden sm:block">
        <Drawing frame={WIDE} props={props} />
      </div>
      <div className="sm:hidden">
        <Drawing frame={NARROW} props={props} />
      </div>
    </div>
  );
}
