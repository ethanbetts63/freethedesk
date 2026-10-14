import { cn } from '@/lib/utils';

import { EXPERIMENT, RECOMMENDATIONS, type Recommendation } from '../_lib/report';
import { LineChart } from './LineChart';
import { Exhibit } from './Exhibits';
import { ImpactCostTags, RunIn, cardClass, display } from './ReportPrimitives';

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
  return (
    <Numbered n={n}>
      <CardTitle tags={<ImpactCostTags impact={rec.impact} cost={rec.cost} />}>
        <span className="sr-only">{n}. </span>
        {rec.title}
      </CardTitle>
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

export function ExperimentList() {
  const { weeks } = EXPERIMENT;
  return (
    <ol className="m-0 flex list-none flex-col gap-s p-0">
      <Numbered n={1}>
        <CardTitle>{EXPERIMENT.title}</CardTitle>
        <RunIn label="What">{EXPERIMENT.what}</RunIn>
        <RunIn label="Hypothesis">{EXPERIMENT.hypothesis}</RunIn>
        <Exhibit caption={EXPERIMENT.label} window={EXPERIMENT.window}>
          <LineChart
            ariaLabel={`Clicks a week from hot water searches, weeks ending ${weeks[0]} to ${weeks[weeks.length - 1]}: ${EXPERIMENT.experiment.join(', ')}. Adjusted for the site-wide trend alone: ${EXPERIMENT.adjusted.join(', ')}. The change shipped on 9 September; the goal is ${EXPERIMENT.goal} a week.`}
            series={[
              { label: 'This experiment', values: EXPERIMENT.experiment, tone: 'now', dots: true },
              {
                label: 'Adjusted for site-wide trend',
                values: EXPERIMENT.adjusted,
                tone: 'compare',
                dots: true,
              },
            ]}
            xLabels={weeks.map((label, at) => ({ at, label }))}
            xLabelsNarrow={weeks
              .map((label, at) => ({ at, label }))
              .filter(({ at }) => at % 2 === 0)}
            xTitle="Week ending"
            left={{ min: 0, max: 20, ticks: [0, 5, 10, 15, 20], title: 'Clicks a week' }}
            marker={{ at: EXPERIMENT.shippedAt, label: 'Shipped' }}
            goal={{ value: EXPERIMENT.goal, label: `Goal ${EXPERIMENT.goal}` }}
          />
        </Exhibit>
        <RunIn label="So far">{EXPERIMENT.soFar}</RunIn>
        <RunIn label="Confounding variables">{EXPERIMENT.alongside}</RunIn>
      </Numbered>
    </ol>
  );
}
