import { cn } from '@/lib/utils';

import {
  EXPERIMENTS,
  EXPERIMENT_WEEKS,
  RECOMMENDATIONS,
  type Experiment,
  type Recommendation,
} from '../_lib/report';
import { LineChart } from './LineChart';
import { RecShot } from './RecShots';
import { Exhibit } from './Exhibits';
import { ExperimentTag, ImpactCostTags, RunIn, cardClass, display } from './ReportPrimitives';

/** The numeral in the card's left gutter, level with its title. */
function Numbered({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className={cn(cardClass, 'grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-s sm:gap-x-m')}>
      <span
        aria-hidden="true"
        className={cn(
          display,
          'text-title-sm leading-none font-heavy tracking-tight text-action-primary tabular-nums',
        )}
      >
        {n}
      </span>
      <div className="min-w-0">{children}</div>
    </li>
  );
}

function CardTitle({ children, tags }: { children: React.ReactNode; tags?: React.ReactNode }) {
  return (
    <h3
      className={cn(
        display,
        'm-0 mb-xs flex flex-wrap items-baseline gap-x-xs gap-y-2xs text-body leading-snug font-strong text-text-primary',
      )}
    >
      <span>{children}</span>
      {tags}
    </h3>
  );
}

function RecommendationCard({ rec, n }: { rec: Recommendation; n: number }) {
  const body = (
    <>
      <RunIn label="What we found">{rec.what}</RunIn>
      <RunIn label="Why">{rec.why}</RunIn>
      <p className="m-0 mb-3xs">
        <strong className="font-strong text-text-primary">How.</strong>
      </p>
      <ul className="m-0 list-disc pl-ml marker:text-text-subtle">
        {rec.how.map((step) => (
          <li key={step} className="mb-3xs">
            {step}
          </li>
        ))}
      </ul>
    </>
  );
  return (
    <Numbered n={n}>
      <CardTitle tags={<ImpactCostTags impact={rec.impact} cost={rec.cost} />}>
        <span className="sr-only">{n}. </span>
        {rec.title}
      </CardTitle>
      {rec.shot ? (
        // The screenshot sits beside the text on a wide screen, as the report sets it, and above
        // it on a phone; a phone screenshot takes a narrower column than a browser one.
        <div
          className={cn(
            'flex flex-col-reverse md:grid md:items-start md:gap-m',
            rec.shot === 'phone-header'
              ? 'md:grid-cols-[minmax(0,1fr)_11rem]'
              : 'md:grid-cols-[minmax(0,1fr)_minmax(0,21rem)]',
          )}
        >
          <div className="min-w-0">{body}</div>
          <RecShot kind={rec.shot} />
        </div>
      ) : (
        body
      )}
    </Numbered>
  );
}

export function RecommendationList() {
  return (
    <ol className="m-0 flex list-none flex-col gap-s p-0">
      {RECOMMENDATIONS.map((rec, index) => (
        <RecommendationCard key={rec.title} rec={rec} n={index + 1} />
      ))}
    </ol>
  );
}

const weekLabels = EXPERIMENT_WEEKS.map((label, at) => ({ at, label }));

function ExperimentCard({ exp, n }: { exp: Experiment; n: number }) {
  const first = EXPERIMENT_WEEKS[0];
  const last = EXPERIMENT_WEEKS[EXPERIMENT_WEEKS.length - 1];
  return (
    <Numbered n={n}>
      <CardTitle tags={<ExperimentTag impact={exp.impact} />}>{exp.title}</CardTitle>
      <RunIn label="What">{exp.what}</RunIn>
      <RunIn label="Hypothesis">{exp.hypothesis}</RunIn>
      <Exhibit caption={exp.label} window={exp.window}>
        <LineChart
          ariaLabel={`${exp.label}, weeks ending ${first} to ${last}: ${exp.experiment.join(', ')}. Adjusted for the site-wide trend alone: ${exp.adjusted.join(', ')}. The change shipped on ${exp.shipped}; the goal is ${exp.goal}.`}
          series={[
            { label: 'This experiment', values: exp.experiment, tone: 'now', dots: true },
            {
              label: 'Adjusted for site-wide trend',
              values: exp.adjusted,
              tone: 'compare',
              dots: true,
            },
          ]}
          xLabels={weekLabels}
          xLabelsNarrow={weekLabels.filter(({ at }) => at % 2 === 0)}
          xTitle="Week ending"
          left={exp.axis}
          invert={exp.axis.invert}
          marker={{ at: exp.shippedAt, label: 'Shipped' }}
          goal={{ value: exp.goal, label: `Goal ${exp.goal}` }}
        />
      </Exhibit>
      <RunIn label="So far">{exp.soFar}</RunIn>
      <RunIn label="Other changes at the same time">{exp.alongside}</RunIn>
    </Numbered>
  );
}

export function ExperimentList() {
  return (
    <ol className="m-0 flex list-none flex-col gap-s p-0">
      {EXPERIMENTS.map((exp, index) => (
        <ExperimentCard key={exp.title} exp={exp} n={index + 1} />
      ))}
    </ol>
  );
}
