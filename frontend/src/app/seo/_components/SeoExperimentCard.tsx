/**
 * A real experiment, as a subscriber sees it: Scooter Shop's r7 findings,
 * "consolidate-service-satellites". The figures are the report's own chart
 * series (freetheplatform/_search/scootershop/reports/r7/report.html), not
 * illustrative numbers - if this card is ever refreshed, take them from a
 * newer report rather than adjusting them by hand.
 */
const WEEKS = ['6 Sep', '13 Sep', '20 Sep', '27 Sep'] as const;
const EXPERIMENT = [30.0, 38.55, 22.28, 14.35] as const;
const ADJUSTED = [36.23, 37.85, 23.21, 19.74] as const;
const SHIPPED_INDEX = 1;
const GOAL = 10;

// Chart geometry, in viewBox units. Position is ranked, so the axis runs
// downwards: first place at the top.
// A narrow viewBox on purpose: SVG text scales with the chart, and at phone
// width a wide one shrank the labels to 6px.
const WIDTH = 420;
const HEIGHT = 196;
const LEFT = 34;
const RIGHT = 408;
const TOP = 14;
const BOTTOM = 160;
const LABEL_SIZE = 13;
const Y_MIN = 5;
const Y_MAX = 45;
const Y_TICKS = [10, 20, 30, 40] as const;

const x = (index: number) => LEFT + (index / (WEEKS.length - 1)) * (RIGHT - LEFT);
const y = (position: number) => TOP + ((position - Y_MIN) / (Y_MAX - Y_MIN)) * (BOTTOM - TOP);
const points = (series: readonly number[]) =>
  series.map((value, index) => `${x(index)},${y(value)}`).join(' ');

function Series({ values, className }: { values: readonly number[]; className: string }) {
  return (
    <g className={className}>
      <polyline points={points(values)} fill="none" stroke="currentColor" strokeWidth="2.5" />
      {values.map((value, index) => (
        <circle key={index} cx={x(index)} cy={y(value)} r="3.5" fill="currentColor" />
      ))}
    </g>
  );
}

function ExperimentChart() {
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="block h-auto w-full"
      role="img"
      aria-label="Average position of the service page on workshop searches, weekly: 30 before the change, 38.6 the week it shipped, then 22.3 and 14.4. Adjusted for the site-wide trend it would have been 19.7. The goal is 10."
    >
      <g className="text-border-default">
        {Y_TICKS.map((tick) => (
          <line
            key={tick}
            x1={LEFT}
            x2={RIGHT}
            y1={y(tick)}
            y2={y(tick)}
            stroke="currentColor"
            strokeDasharray="2 4"
          />
        ))}
        <line x1={LEFT} x2={RIGHT} y1={BOTTOM} y2={BOTTOM} stroke="currentColor" />
      </g>

      <g className="fill-current text-text-muted" fontSize={LABEL_SIZE}>
        {Y_TICKS.map((tick) => (
          <text key={tick} x={LEFT - 8} y={y(tick) + 4} textAnchor="end">
            {tick}
          </text>
        ))}
        {WEEKS.slice(1).map((week, index) => (
          // The last label ends at the plot edge rather than overhanging it.
          <text
            key={week}
            x={x(index + 1)}
            y={BOTTOM + 20}
            textAnchor={index + 1 === WEEKS.length - 1 ? 'end' : 'middle'}
          >
            {week}
          </text>
        ))}
      </g>

      <g className="text-text-success">
        <line
          x1={LEFT}
          x2={RIGHT}
          y1={y(GOAL)}
          y2={y(GOAL)}
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="7 6"
        />
        <text
          x={RIGHT}
          y={y(GOAL) - 6}
          textAnchor="end"
          fontSize={LABEL_SIZE}
          className="fill-current font-strong"
        >
          Goal {GOAL}
        </text>
      </g>

      <g className="text-text-primary">
        <line
          x1={x(SHIPPED_INDEX)}
          x2={x(SHIPPED_INDEX)}
          y1={TOP}
          y2={BOTTOM}
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <text
          x={x(SHIPPED_INDEX) + 6}
          y={BOTTOM - 6}
          fontSize={LABEL_SIZE}
          className="fill-current"
        >
          Shipped
        </text>
      </g>

      <Series values={ADJUSTED} className="text-text-subtle" />
      <Series values={EXPERIMENT} className="text-action-primary" />
    </svg>
  );
}

const labelClassName = 'font-heavy text-text-primary';

export function SeoExperimentCard() {
  return (
    <article
      className="rounded-m border border-border-default bg-surface-page p-l text-body-sm leading-relaxed text-text-secondary shadow-contrast-l sm:p-xl"
      aria-labelledby="seo-experiment-card-title"
    >
      <header className="mb-m flex flex-wrap items-start justify-between gap-s">
        <h3
          id="seo-experiment-card-title"
          className="m-0 text-lead leading-snug font-heavy tracking-[-0.02em] text-text-primary"
        >
          Workshop pages folded into /service
        </h3>
        <span className="rounded-xs bg-surface-tint px-xs py-3xs font-mono text-caption tracking-label-tight text-text-muted uppercase">
          Shipped 13/9/2026
        </span>
      </header>

      <p className="m-0">
        <strong className={labelClassName}>What.</strong> Three workshop pages were retired into
        /service, each redirecting to it permanently.
      </p>
      <p className="mt-s mb-0">
        <strong className={labelClassName}>Hypothesis.</strong> If the retired pages&apos; standing
        moves to /service, it will reach the top ten for workshop searches with its impressions
        rising, because demand that was split across four near-identical pages now has one page to
        land on.
      </p>

      <figure className="m-0 mt-l">
        <figcaption>
          <strong className="block text-body-sm font-heavy text-text-primary">
            Where /service ranks on workshop searches
          </strong>
          <span className="mt-3xs block text-caption text-text-muted">
            Weekly average position. The grey line is where it would be had it only followed the
            site-wide trend; the gap between the lines is what the change added.
          </span>
        </figcaption>
        <div
          className="mt-s flex flex-wrap gap-m text-caption text-text-secondary"
          aria-hidden="true"
        >
          <span className="flex items-center gap-2xs">
            <i className="inline-block h-[3px] w-[16px] bg-action-primary" /> This experiment
          </span>
          <span className="flex items-center gap-2xs">
            <i className="inline-block h-[3px] w-[16px] bg-text-subtle" /> Adjusted for site-wide
            trend
          </span>
        </div>
        <div className="mt-2xs">
          <ExperimentChart />
        </div>
      </figure>

      <p className="mt-m mb-0">
        <strong className={labelClassName}>So far.</strong> The service page climbed eight places.
        Searched from Perth it is already first, second and fifth on its three searches. Workshop
        searches overall are still flat.
      </p>
    </article>
  );
}
