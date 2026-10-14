import { cn } from '@/lib/utils';

import { reportDisplay } from '../_lib/fonts';
import type { Cost, Impact } from '../_lib/report';

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

const impactTone: Record<Impact, string> = {
  // High impact is the good news, so it is solid ink rather than a warning colour.
  high: 'bg-surface-inverse text-text-on-dark',
  medium: 'bg-transparent text-text-secondary ring-1 ring-inset ring-border-strong-hover',
  low: 'bg-surface-tint-strong text-text-chrome',
};

/** A value from a controlled vocabulary, set in the mono face as the PDF sets it. */
export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-block rounded-xs px-2xs py-4xs font-mono text-caption font-medium tracking-wide whitespace-nowrap uppercase',
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
      <Tag className={impactTone.low}>Cost: {cost}</Tag>
    </span>
  );
}

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

/** The aside a tile closes with when a limit changes how a figure should be read. */
export function LimitCallout({ children }: { children: React.ReactNode }) {
  return (
    <aside className="my-ml rounded-r-md border-l-4 border-fill-warning bg-surface-warning px-m py-m">
      <p className="m-0">{children}</p>
    </aside>
  );
}
