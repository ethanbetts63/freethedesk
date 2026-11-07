import {
  EXPERIMENTS,
  EXPERIMENT_WEEKS,
  RECOMMENDATIONS,
  printOrder,
  type Experiment,
  type Recommendation,
} from '../_lib/report';
import { Exhibit } from './Exhibits';
import { LineChart } from './LineChart';
import { RecShot } from './RecShots';
import { ExperimentTag, ImpactCostTags, RecLabel } from './ReportPrimitives';

/**
 * The card, as compose.recommendation writes it: the title with its tags, then what was found, why it matters and
 * how to fix it, each label on a line of its own with its words under it. The screenshot floats beside what was
 * found, in the title's block, so the card's text wraps round it.
 */
function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <li id={rec.id}>
      <div className="rec__lead">
        <h3 className="rec__title">
          <span>{rec.title}</span> <ImpactCostTags impact={rec.impact} cost={rec.cost} />
        </h3>
        {rec.shot && <RecShot kind={rec.shot} />}
        <p>
          <RecLabel>What we found:</RecLabel> {rec.what}
        </p>
      </div>
      <p>
        <RecLabel>Why it matters:</RecLabel> {rec.why}
      </p>
      <p>
        <RecLabel>How to fix it:</RecLabel>
      </p>
      <ul className="steps">
        {rec.how.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ul>
    </li>
  );
}

/** The work asked of the owner, highest impact first, the access ask last (vocab.in_print_order). */
export function RecommendationList() {
  return (
    <ol className="recommendations">
      {printOrder(RECOMMENDATIONS).map((rec) => (
        <RecommendationCard key={rec.id} rec={rec} />
      ))}
    </ol>
  );
}

const weekLabels = EXPERIMENT_WEEKS.map((label, at) => ({ at, label }));

/** A running experiment's card, as compose.experiment writes it: the impact pill at the title's end, no date pill. */
function ExperimentCard({ exp }: { exp: Experiment }) {
  const first = EXPERIMENT_WEEKS[0];
  const last = EXPERIMENT_WEEKS[EXPERIMENT_WEEKS.length - 1];
  return (
    <li id={exp.id}>
      <h3 className="exp__title">
        <span>{exp.title}</span> <ExperimentTag impact={exp.impact} />
      </h3>
      <p>
        <strong>What.</strong> {exp.what}
      </p>
      <p>
        <strong>Hypothesis.</strong> {exp.hypothesis}
      </p>
      <Exhibit weight="compact" caption={exp.label} window={exp.window}>
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
      <p>
        <strong>So far.</strong> {exp.soFar}
      </p>
      <p>
        <strong>Other changes at the same time.</strong> {exp.alongside}
      </p>
    </li>
  );
}

export function ExperimentList() {
  return (
    <ol className="experiments">
      {EXPERIMENTS.map((exp) => (
        <ExperimentCard key={exp.id} exp={exp} />
      ))}
    </ol>
  );
}
