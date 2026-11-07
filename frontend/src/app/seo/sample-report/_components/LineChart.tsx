import { AXIS, CHART_FONT } from './chartFrame';

/**
 * The experiments' line chart, drawn as inline SVG in the house look the engine's Vega config gives it: blue is this
 * experiment, grey where it would be on the site-wide trend alone, a dotted grid, axis titles, the dashed goal and
 * the "Shipped" rule, the legend over the plot. The engine draws each chart twice, at a desktop's width and a
 * phone's, and the stylesheet shows one; so does this.
 */

export type Tone = 'now' | 'compare';

const STROKE: Record<Tone, string> = {
  now: 'var(--accent)',
  compare: 'var(--slate-400)',
};

export type LineSeries = {
  label: string;
  values: readonly number[];
  tone: Tone;
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
  /** Ranked axes run downwards: first place at the top. */
  invert?: boolean;
  marker?: { at: number; label: string };
  goal?: { value: number; label: string };
};

type Frame = { width: number; height: number };

const WIDE: Frame = { width: 760, height: 300 };
const NARROW: Frame = { width: 320, height: 240 };

function Drawing({
  frame,
  props,
  className,
}: {
  frame: Frame;
  props: LineChartProps;
  className: string;
}) {
  const { width, height } = frame;
  const { series, left, invert, marker, goal, xTitle } = props;
  const labels = frame === NARROW && props.xLabelsNarrow ? props.xLabelsNarrow : props.xLabels;
  const count = series[0]?.values.length ?? 0;

  const plotLeft = left.title ? 46 : 32;
  // Room past the last point for its date and the goal's label, which centre and end on the plot's edge.
  const plotRight = width - 26;
  const plotTop = 30;
  const plotBottom = height - (xTitle ? 40 : 24);

  const x = (index: number) =>
    plotLeft + (count <= 1 ? 0 : (index / (count - 1)) * (plotRight - plotLeft));
  const yLeft = (value: number) => {
    const share = (value - left.min) / (left.max - left.min);
    return invert
      ? plotTop + share * (plotBottom - plotTop)
      : plotBottom - share * (plotBottom - plotTop);
  };

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={props.ariaLabel}
    >
      {/* The legend over the plot, as the house config places it. */}
      <g fontSize={CHART_FONT} style={{ fill: AXIS.ink }}>
        {series.map((line, index) => {
          const at = plotLeft + index * (frame === NARROW ? 130 : 190);
          return (
            <g key={line.label}>
              <line
                x1={at}
                x2={at + 14}
                y1={11}
                y2={11}
                strokeWidth="2"
                style={{ stroke: STROKE[line.tone] }}
              />
              <text x={at + 19} y={15}>
                {line.label}
              </text>
            </g>
          );
        })}
      </g>

      <g style={{ stroke: AXIS.rule }}>
        {left.ticks.map((tick) => (
          <line
            key={tick}
            x1={plotLeft}
            x2={plotRight}
            y1={yLeft(tick)}
            y2={yLeft(tick)}
            strokeDasharray="2 3"
          />
        ))}
        <line x1={plotLeft} x2={plotRight} y1={plotBottom} y2={plotBottom} />
      </g>

      <g fontSize={CHART_FONT} style={{ fill: AXIS.muted }}>
        {left.ticks.map((tick) => (
          <text key={tick} x={plotLeft - 6} y={yLeft(tick) + 4} textAnchor="end">
            {tick.toLocaleString('en-AU')}
          </text>
        ))}
        {labels.map(({ at, label }) => (
          <text key={label} x={x(at)} y={plotBottom + 16} textAnchor="middle">
            {label}
          </text>
        ))}
      </g>

      <g fontSize={CHART_FONT} fontWeight={600} style={{ fill: AXIS.muted }}>
        {left.title && (
          <text
            transform={`translate(12 ${(plotTop + plotBottom) / 2}) rotate(-90)`}
            textAnchor="middle"
          >
            {left.title}
          </text>
        )}
        {xTitle && (
          <text x={(plotLeft + plotRight) / 2} y={height - 6} textAnchor="middle">
            {xTitle}
          </text>
        )}
      </g>

      {goal && (
        <g style={{ stroke: 'var(--good-fill)', fill: 'var(--good)' }}>
          <line
            x1={plotLeft}
            x2={plotRight}
            y1={yLeft(goal.value)}
            y2={yLeft(goal.value)}
            strokeWidth="1.5"
            strokeDasharray="6 5"
          />
          <text
            x={plotRight}
            y={yLeft(goal.value) - 5}
            textAnchor="end"
            fontSize={CHART_FONT}
            style={{ stroke: 'none' }}
          >
            {goal.label}
          </text>
        </g>
      )}

      {marker && (
        <g style={{ stroke: 'var(--ink-2)', fill: 'var(--ink-2)' }}>
          <line x1={x(marker.at)} x2={x(marker.at)} y1={plotTop} y2={plotBottom} strokeWidth="1" />
          <text
            x={x(marker.at) + 4}
            y={plotBottom - 5}
            fontSize={CHART_FONT}
            style={{ stroke: 'none' }}
          >
            {marker.label}
          </text>
        </g>
      )}

      {series.map((line) => {
        const points = line.values.map((value, index) => `${x(index)},${yLeft(value)}`).join(' ');
        return (
          <g key={line.label} style={{ stroke: STROKE[line.tone], fill: STROKE[line.tone] }}>
            <polyline points={points} fill="none" strokeWidth="1.8" strokeLinejoin="round" />
            {line.dots &&
              line.values.map((value, index) => (
                <circle key={index} cx={x(index)} cy={yLeft(value)} r="2.8" stroke="none" />
              ))}
          </g>
        );
      })}
    </svg>
  );
}

export function LineChart(props: LineChartProps) {
  return (
    <>
      <Drawing frame={WIDE} props={props} className="chart chart--wide" />
      <Drawing frame={NARROW} props={props} className="chart chart--phone" />
    </>
  );
}
