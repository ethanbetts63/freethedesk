import type { BarRow, PairedRow } from '../_lib/report';
import { AXIS, CHART_FONT, type Frame, NARROW, WIDE, niceTicks, wrapLabel } from './chartFrame';

/**
 * One exhibit, as compose.figure writes it: the caption, the window line, the drawing in its host, and the
 * source line. The engine draws every chart twice at render, as a desktop lays it out and as a phone does, and
 * the stylesheet shows one (`.chart--wide`, `.chart--phone`); the drawings here do the same.
 */
export function Exhibit({
  weight = 'plain',
  caption,
  window,
  note,
  children,
}: {
  weight?: 'plain' | 'hero' | 'compact';
  caption: string;
  window?: string;
  note?: string;
  children: React.ReactNode;
}) {
  const classes = {
    plain: 'exhibit',
    hero: 'exhibit exhibit--hero',
    compact: 'exhibit exhibit--compact',
  } as const;
  return (
    <figure className={classes[weight]}>
      <figcaption className="exhibit__caption">{caption}</figcaption>
      {window && <p className="exhibit__window">{window}</p>}
      <div className="vega-host">{children}</div>
      {note && <p className="exhibit__source">{note}</p>}
    </figure>
  );
}

type Tone = 'now' | 'compare' | 'dim';

/** The engine's colours (palette.py, through tokens.css): this period, the period before, and the rest. */
const FILL: Record<Tone, string> = {
  now: 'var(--accent)',
  compare: 'var(--blue-400)',
  dim: 'var(--slate-300)',
};

type Bar = { tone: Tone; value: number };
type Row = { label: string; bars: readonly Bar[] };

type BarDrawingProps = {
  ariaLabel: string;
  rows: readonly Row[];
  legend?: readonly { label: string; tone: Tone }[];
  valueTitle: string;
};

/**
 * A horizontal bar chart in the house look the engine's Vega config gives every chart: the categories down the
 * left, a dotted grid on the value axis, its title under it, and a legend over the plot when there are two
 * series. Drawn at the desktop's width and the phone's, as render.freeze draws a Vega chart.
 */
function BarDrawing({
  frame,
  props,
  className,
}: {
  frame: Frame;
  props: BarDrawingProps;
  className: string;
}) {
  const { rows, legend, valueTitle } = props;
  const { width, labelColumn, labelChars } = frame;
  const labels = rows.map((row) => wrapLabel(row.label, labelChars));
  const perBar = rows[0]?.bars.length ?? 1;
  const barHeight = perBar > 1 ? 11 : 15;
  const rowHeights = labels.map((lines) =>
    Math.max(perBar * (barHeight + 3) + 11, lines.length * (CHART_FONT + 2) + 10),
  );
  const top = legend ? 28 : 8;
  const plotLeft = labelColumn + 10;
  const plotRight = width - 14;
  const plotBottom = top + rowHeights.reduce((sum, h) => sum + h, 0);
  const height = plotBottom + 44;
  const max = Math.max(...rows.flatMap((row) => row.bars.map((bar) => bar.value)));
  const ticks = niceTicks(max);
  const scale = (value: number) =>
    plotLeft + (value / ticks[ticks.length - 1]) * (plotRight - plotLeft);

  const starts = rowHeights.map((_, index) =>
    rowHeights.slice(0, index).reduce((sum, h) => sum + h, top),
  );
  const placed = rows.map((row, index) => ({
    row,
    start: starts[index],
    height: rowHeights[index],
    lines: labels[index],
  }));

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={props.ariaLabel}
    >
      {legend && (
        <g fontSize={CHART_FONT} style={{ fill: AXIS.ink }}>
          {legend.map((item, index) => {
            const x = plotLeft + index * 190;
            return (
              <g key={item.label}>
                <rect x={x} y={6} width={11} height={11} rx={1} style={{ fill: FILL[item.tone] }} />
                <text x={x + 16} y={15.5}>
                  {item.label}
                </text>
              </g>
            );
          })}
        </g>
      )}
      <g style={{ stroke: AXIS.rule }}>
        {ticks.map((tick) => (
          <line
            key={tick}
            x1={scale(tick)}
            x2={scale(tick)}
            y1={top}
            y2={plotBottom}
            strokeDasharray="2 3"
          />
        ))}
        <line x1={plotLeft} x2={plotLeft} y1={top} y2={plotBottom} />
      </g>
      <g fontSize={CHART_FONT} style={{ fill: AXIS.muted }}>
        {placed.map(({ row, start, height: rowHeight, lines }) => {
          const middle = start + rowHeight / 2;
          const first = middle - ((lines.length - 1) * (CHART_FONT + 2)) / 2 + 4;
          return (
            <text key={row.label} x={labelColumn} y={first} textAnchor="end">
              {lines.map((line, index) => (
                <tspan key={line} x={labelColumn} dy={index ? CHART_FONT + 2 : 0}>
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}
        {ticks.map((tick) => (
          <text key={tick} x={scale(tick)} y={plotBottom + 16} textAnchor="middle">
            {tick.toLocaleString('en-AU')}
          </text>
        ))}
        <text
          x={(plotLeft + plotRight) / 2}
          y={plotBottom + 36}
          textAnchor="middle"
          fontWeight={600}
        >
          {valueTitle}
        </text>
      </g>
      {placed.map(({ row, start, height: rowHeight }) => {
        const group = row.bars.length * barHeight + (row.bars.length - 1) * 3;
        const first = start + (rowHeight - group) / 2;
        return (
          <g key={row.label}>
            {row.bars.map((bar, index) => (
              <rect
                key={index}
                x={plotLeft}
                y={first + index * (barHeight + 3)}
                width={Math.max(0, scale(bar.value) - plotLeft)}
                height={barHeight}
                style={{ fill: FILL[bar.tone] }}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

function BarChart(props: BarDrawingProps) {
  return (
    <>
      <BarDrawing frame={WIDE} props={props} className="chart chart--wide" />
      <BarDrawing frame={NARROW} props={props} className="chart chart--phone" />
    </>
  );
}

/**
 * This period against the one before, one pair of bars per row: dark blue now, light blue before, in every chart,
 * so the comparison reads without a key.
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
  return (
    <BarChart
      ariaLabel={`${valueTitle}, ${nowLabel} against ${beforeLabel}: ${rows
        .map((row) => `${row.label} ${row.now} against ${row.before}`)
        .join('; ')}.`}
      rows={rows.map((row) => ({
        label: row.label,
        bars: [
          { tone: 'now', value: row.now },
          { tone: 'compare', value: row.before },
        ],
      }))}
      legend={[
        { label: nowLabel, tone: 'now' },
        { label: beforeLabel, tone: 'compare' },
      ]}
      valueTitle={valueTitle}
    />
  );
}

/** One bar per row, the row the text is about in blue and the rest grey, so the answer is the bar that stands out. */
export function Bars({
  rows,
  highlight,
  valueTitle,
}: {
  rows: readonly BarRow[];
  highlight: string;
  valueTitle: string;
}) {
  return (
    <BarChart
      ariaLabel={`${valueTitle}: ${rows.map((row) => `${row.label} ${row.value}`).join('; ')}.`}
      rows={rows.map((row) => ({
        label: row.label,
        bars: [{ tone: row.label === highlight ? 'now' : 'dim', value: row.value }],
      }))}
      valueTitle={valueTitle}
    />
  );
}
