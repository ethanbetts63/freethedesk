import { ChartPie } from 'lucide-react';

import { cn } from '@/lib/utils';

import { CostTag, EXPERIMENT_IMPACTS, ExperimentTag, ImpactTag, display } from './ReportPrimitives';

/**
 * The loop every delivered report opens with, unnumbered before section 01. The
 * words are the report renderer's own (freetheplatform searchconsole/guide.py),
 * so the sample reads as a real report does.
 */
const STEPS = [
  {
    name: 'Recommendations',
    where: { href: '#recommendations', label: 'Section 01' },
    text: 'What we think you should change, ranked by impact. Each recommendation says what we found, why it matters and how to fix it. We also estimate the size of the change and list sources if available.',
    pills: (
      <>
        <ImpactTag impact="high" />
        <ImpactTag impact="medium" />
        <ImpactTag impact="low" />
        <CostTag cost="low" />
      </>
    ),
  },
  {
    name: 'Make the change',
    where: { label: 'Your site' },
    text: "You, us, or whoever else runs your site, implements your selected recommendations. Where you believe a recommendation to be wrong, or you're just not interested, tell us which one and why and we will take this into account for future reports.",
  },
  {
    name: 'Experiments',
    where: { href: '#experiments', label: 'Section 02' },
    text: 'Most recommendations once implemented can have their impact tracked empirically. This allows us to learn. False recommendations should be undone, and good recommendations should be implemented more if possible.',
    pills: (
      <>
        {EXPERIMENT_IMPACTS.map((impact) => (
          <ExperimentTag key={impact} impact={impact} />
        ))}
      </>
    ),
  },
  {
    name: 'The next report',
    where: { label: 'Next time' },
    text: 'Completed or rejected recommendations are dropped. Implemented changes are tracked as experiments. We investigate different avenues to ensure report value.',
  },
] as const satisfies readonly {
  name: string;
  where: { href?: string; label: string };
  text: string;
  pills?: React.ReactNode;
}[];

const whereClass = cn(display, 'text-caption font-semibold tracking-label uppercase');

function Where({ where }: { where: { href?: string; label: string } }) {
  return 'href' in where && where.href ? (
    <a href={where.href} className={cn(whereClass, 'text-text-action underline')}>
      {where.label}
    </a>
  ) : (
    <span className={cn(whereClass, 'text-text-subtle')}>{where.label}</span>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-2xl border-t border-border-subtle pt-2xl">
      <h2
        className={cn(
          display,
          'm-0 mb-ml text-title-sm leading-tight font-strong tracking-tight text-text-secondary',
        )}
      >
        How this report works
      </h2>
      <ol className="relative m-0 list-none p-0">
        {/* The loop's line, from the first step to the last and back. */}
        <span
          aria-hidden="true"
          className="absolute top-s bottom-s left-[1.1875rem] w-px bg-border-default"
        />
        {STEPS.map((step, index) => (
          <li
            key={step.name}
            className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-m pb-ml"
          >
            <span
              className={cn(
                display,
                'relative flex size-10 items-center justify-center rounded-full bg-surface-dark text-body font-strong text-text-on-dark tabular-nums',
              )}
            >
              {index + 1}
            </span>
            <div className="min-w-0 pt-2xs">
              <h3 className="m-0 mb-2xs flex flex-wrap items-baseline gap-x-s">
                <span className={cn(display, 'text-lead font-strong text-text-primary')}>
                  {step.name}
                </span>
                <Where where={step.where} />
              </h3>
              <p className="m-0">{step.text}</p>
              {'pills' in step && <p className="m-0 mt-s flex flex-wrap gap-2xs">{step.pills}</p>}
            </div>
          </li>
        ))}
      </ol>
      <aside className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-m rounded-md bg-surface-tint px-m py-ml">
        <ChartPie aria-hidden="true" className="size-10 text-action-primary" />
        <div className="min-w-0">
          <h3 className="m-0 mb-2xs flex flex-wrap items-baseline gap-x-s">
            <span className={cn(display, 'text-lead font-strong text-text-primary')}>
              Data analysis
            </span>
            <Where where={{ href: '#analysis', label: 'Section 03' }} />
          </h3>
          <p className="m-0">
            A deep dive into the data behind your digital presence. Every report, we search for
            interesting trends, anomalies and observations to help us and you better understand your
            business.
          </p>
        </div>
      </aside>
    </section>
  );
}
