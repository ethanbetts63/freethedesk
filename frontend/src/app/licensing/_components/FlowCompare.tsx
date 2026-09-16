import styles from "../page.module.css";

type Step = { title: string; caption?: string };

const hostedSteps: Step[] = [
  { title: "Log in to our portal" },
  { title: "Enter the vehicle details" },
  { title: "Send the customer their secure link" },
  { title: "Customer signs online" },
  { title: "Paperwork lands back in your queue" },
];

const builtInSteps: Step[] = [
  { title: "Customer enters their details" },
  { title: "Customer verifies their identity" },
  { title: "Customer signs online" },
  { title: "Paperwork lands in your queue" },
];

function FlowColumn({
  label,
  badge,
  steps,
  highlight,
  eyebrow,
}: {
  label: string;
  badge: string;
  steps: Step[];
  highlight?: boolean;
  eyebrow?: string;
}) {
  return (
    <div className={`${styles.flowColumn} ${highlight ? styles.flowColumnHighlight : ""}`}>
      {eyebrow && (
        <p className="m-0 mb-s text-meta font-black tracking-[0.12em] uppercase moving-colour-text">{eyebrow}</p>
      )}
      <header className={styles.flowColumnHead}>
        <span>{label}</span>
        <b>{badge}</b>
      </header>
      <ol className={styles.flowStepsList}>
        {steps.map((step) => (
          <li key={step.title}>
            <span className={styles.flowStepText}>
              <strong>{step.title}</strong>
              {step.caption && <small>{step.caption}</small>}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Side-by-side of what your team does: hosted portal (manual entry) vs. built into your website (automatic). */
export function FlowCompare() {
  return (
    <div className="mt-2xl">
      <p className="m-0 mb-xl text-caption font-control tracking-[0.14em] text-accent-on-dark uppercase">
        What your team does
      </p>
      <div className="grid grid-cols-1 gap-ml min-[900px]:grid-cols-2">
        <FlowColumn label="Hosted portal" badge="5 steps, you enter each sale" steps={hostedSteps} />
        <FlowColumn
          label="Built into your website"
          badge="4 steps, nothing to re-key"
          steps={builtInSteps}
          highlight
          eyebrow="Recommended"
        />
      </div>
    </div>
  );
}
