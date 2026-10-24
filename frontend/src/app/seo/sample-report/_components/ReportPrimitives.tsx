import { cn } from '@/lib/utils';

import { reportDisplay } from '../_lib/fonts';
import type { Cost, ExperimentImpact, Impact } from '../_lib/report';

/** Archivo, for anything that is a reading or a label rather than an argument. */
export const display = reportDisplay.className;

/** The report's small uppercase label: kickers, figure labels, table heads. */
export const labelClass = cn(
  display,
  'text-caption font-semibold tracking-label uppercase text-text-subtle',
);

/** Every block that stands apart from the prose: white, one hairline, rounded, no shadow. */
export const cardClass =
  'rounded-md border border-border-default bg-surface-page px-m py-ml sm:px-ml';

/** The report's pill colours: one colour means one thing across recommendations and experiments. */
const impactTone: Record<Impact, string> = {
  high: 'bg-fill-danger text-text-on-dark',
  medium: 'bg-fill-warning text-text-secondary',
  low: 'bg-fill-success text-text-on-dark',
};

const costTone = 'bg-text-subtle text-text-on-dark';

const experimentTone: Record<ExperimentImpact, string> = {
  high: impactTone.high,
  low: impactTone.low,
  none: costTone,
  negative: 'bg-text-chrome text-text-on-dark',
  unclear: 'bg-transparent text-text-chrome ring-[1.5px] ring-inset ring-border-strong-hover',
};

const experimentLabel: Record<ExperimentImpact, string> = {
  high: 'High impact',
  low: 'Low impact',
  none: 'No impact',
  negative: 'Negative impact',
  unclear: 'Impact unclear',
};

/** A value from a controlled vocabulary, set in the mono face as the PDF sets it. */
export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-xs py-4xs font-mono text-caption font-bold tracking-wide whitespace-nowrap uppercase',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ImpactCostTags({ impact, cost }: { impact: Impact; cost: Cost }) {
  return (
    <span className="inline-flex gap-xs whitespace-nowrap">
      <Tag className={impactTone[impact]}>{impact} impact</Tag>
      <Tag className={costTone}>Cost: {cost}</Tag>
    </span>
  );
}

export function ImpactTag({ impact }: { impact: Impact }) {
  return <Tag className={impactTone[impact]}>{impact} impact</Tag>;
}

export function CostTag({ cost }: { cost: Cost }) {
  return <Tag className={costTone}>Cost: {cost}</Tag>;
}

export function ExperimentTag({ impact }: { impact: ExperimentImpact }) {
  return <Tag className={experimentTone[impact]}>{experimentLabel[impact]}</Tag>;
}

export const EXPERIMENT_IMPACTS = Object.keys(experimentLabel) as ExperimentImpact[];

/** A section opens with its number in a navy box and its kicker on a rule. */
export function ReportSection({
  id,
  number,
  kicker,
  title,
  children,
}: {
  id: string;
  number: string;
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-2xl border-t border-border-subtle pt-2xl pb-xs">
      <div className="mb-m flex items-center gap-s border-b border-border-default pb-s">
        <span
          className={cn(
            display,
            'flex size-10 items-center justify-center rounded-sm bg-surface-dark text-lead font-strong tracking-tight text-text-on-dark tabular-nums',
          )}
        >
          {number}
        </span>
        <span className={cn(labelClass, 'text-label text-action-primary')}>{kicker}</span>
      </div>
      <h2
        className={cn(
          display,
          'm-0 mb-ml text-title-sm leading-tight font-strong tracking-tight text-text-secondary',
        )}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

/** "What we found." and the like: a bold run-in label before the prose it names. */
export function RunIn({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p className="m-0 mb-s">
      <strong className="font-strong text-text-primary">{label}.</strong> {children}
    </p>
  );
}
