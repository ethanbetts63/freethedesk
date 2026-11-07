import type { Cost, ExperimentImpact, Impact } from '../_lib/report';

/**
 * The report engine's own elements, as compose.py writes them (freetheplatform searchconsole): the class names
 * are the engine's, and the stylesheet that reads them is the engine's, copied (`_styles/report.generated.css`).
 * Nothing here is styled by the site.
 */

/** A pill in the mono face: a value from a controlled vocabulary. Complete class strings, one per value. */
const impactTag: Record<Impact, string> = {
  high: 'tag tag--impact-high',
  medium: 'tag tag--impact-medium',
  low: 'tag tag--impact-low',
};

const impactLabel: Record<Impact, string> = {
  high: 'High impact',
  medium: 'Medium impact',
  low: 'Low impact',
};

const experimentTag: Record<ExperimentImpact, string> = {
  high: 'tag tag--exp-high',
  low: 'tag tag--exp-low',
  none: 'tag tag--exp-none',
  negative: 'tag tag--exp-negative',
  unclear: 'tag tag--exp-unclear',
};

/** The engine's words for each experiment pill (vocab.EXPERIMENT_IMPACTS). */
export const EXPERIMENT_LABELS: Record<ExperimentImpact, string> = {
  high: 'High impact',
  low: 'Low impact',
  none: 'No impact',
  negative: 'Negative impact',
  unclear: 'Impact unclear',
};

export const EXPERIMENT_IMPACTS = Object.keys(EXPERIMENT_LABELS) as ExperimentImpact[];

export function ImpactTag({ impact }: { impact: Impact }) {
  return <span className={impactTag[impact]}>{impactLabel[impact]}</span>;
}

export function CostTag({ cost }: { cost: Cost }) {
  return <span className="tag">Cost: {cost}</span>;
}

/** The two tags move as one, so a long title wraps both to the next line together. */
export function ImpactCostTags({ impact, cost }: { impact: Impact; cost: Cost }) {
  return (
    <span className="rec__tags">
      <ImpactTag impact={impact} /> <CostTag cost={cost} />
    </span>
  );
}

export function ExperimentTag({ impact }: { impact: ExperimentImpact }) {
  return <span className={experimentTag[impact]}>{EXPERIMENT_LABELS[impact]}</span>;
}

/** A section opens with its number in a navy box and its kicker on a rule (compose._section). */
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
    <section className="section" id={id}>
      <header className="section__open">
        <span className="section__num">{number}</span>
        <span className="section__kicker">{kicker}</span>
      </header>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

/** A recommendation card's label, on a line of its own, its words under it. */
export function RecLabel({ children }: { children: React.ReactNode }) {
  return <strong className="rec__label">{children}</strong>;
}
