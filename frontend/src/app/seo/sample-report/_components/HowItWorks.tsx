import { CostTag, EXPERIMENT_IMPACTS, ExperimentTag, ImpactTag } from './ReportPrimitives';

/**
 * 'How this report works': the loop as a timeline, unnumbered before section 01, the same in every report. The
 * markup and the words are the engine's own (freetheplatform searchconsole/guide.py), so the sample reads as a
 * delivered report does.
 */
const STEPS = [
  {
    name: 'Recommendations',
    where: { href: '#section-01', label: 'Section 01' },
    text: 'What we think you should change, ranked by impact. Each recommendation says what we found, why it matters and how to fix it. We also estimate the size of the change, likely impact and list sources if available.',
    pills: (
      <>
        <ImpactTag impact="high" /> <ImpactTag impact="medium" /> <ImpactTag impact="low" />{' '}
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
    where: { href: '#section-02', label: 'Section 02' },
    text: 'Most recommendations once implemented can have their impact tracked empirically. This allows us to learn. False recommendations should be undone, and good recommendations should be implemented more if possible.',
    pills: (
      <>
        {EXPERIMENT_IMPACTS.map((impact, index) => (
          <span key={impact}>
            {index > 0 && ' '}
            <ExperimentTag impact={impact} />
          </span>
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

/** The decorative pie beside the data analysis (guide.PIE): shares of the loop's colours, clockwise from twelve. */
const PIE =
  'conic-gradient(var(--blue-600) 0deg 151deg, var(--sky-500) 151deg 245deg, var(--purple-accent) 245deg 310deg, var(--blue-950) 310deg 360deg)';

function Where({ where }: { where: { href?: string; label: string } }) {
  return 'href' in where && where.href ? (
    <a className="guide__where" href={where.href}>
      {where.label}
    </a>
  ) : (
    <span className="guide__where">{where.label}</span>
  );
}

export function HowItWorks() {
  return (
    <section className="section section--guide" id="how-it-works">
      <h2>How this report works</h2>
      <div className="guide">
        <ol className="guide__list">
          {STEPS.map((step, index) => (
            <li key={step.name} className="guide__step">
              <span className="guide__dot">{index + 1}</span>
              <div>
                <p className="guide__name">
                  <strong>{step.name}</strong> <Where where={step.where} />
                </p>
                <p>{step.text}</p>
                {'pills' in step && <p className="guide__pills">{step.pills}</p>}
              </div>
            </li>
          ))}
        </ol>
        <div className="guide__back" aria-hidden="true">
          <span>back to 1</span>
        </div>
      </div>
      <div className="guide__aside">
        <span className="guide__pie" aria-hidden="true" style={{ background: PIE }} />
        <div>
          <p className="guide__name">
            <strong>Data analysis</strong>{' '}
            <Where where={{ href: '#section-03', label: 'Section 03' }} />
          </p>
          <p>
            A deep dive into the data behind your digital presence. Every report, we search for
            interesting trends, anomalies and observations to help us and you better understand your
            business.
          </p>
        </div>
      </div>
    </section>
  );
}
