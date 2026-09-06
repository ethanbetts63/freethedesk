import styles from "./page.module.css";

const hostedSteps = ["Vehicle sold", "Dealer enters details", "Secure link emailed", "Customer logs in"];
const builtInSteps = ["Customer selects vehicle", "Details already filled"];

function Lane({ label, steps }: { label: string; steps: string[] }) {
  return (
    <div className={styles.flowLane}>
      <span className={styles.flowLaneLabel}>{label}</span>
      <div className={styles.flowSteps}>
        {steps.map((step, index) => (
          <span key={step}>
            <i className={styles.flowStep}>{step}</i>
            {index < steps.length - 1 && <b className={styles.flowDash} aria-hidden="true" />}
          </span>
        ))}
        <b className={styles.flowDash} aria-hidden="true" />
      </div>
    </div>
  );
}

/** Compares the hosted-portal and built-in-website flows, converging where the steps are shared. */
export function FlowCompare() {
  return (
    <div className={styles.flowCompare}>
      <div className={styles.flowLanes}>
        <Lane label="Hosted portal" steps={hostedSteps} />
        <Lane label="Built into your website" steps={builtInSteps} />
      </div>
      <div className={styles.flowBracket} aria-hidden="true" />
      <div className={styles.flowMerge}>
        <i className={styles.flowStepMerged}>Signs paperwork online</i>
        <b className={styles.flowDash} aria-hidden="true" />
        <div>
          <i className={styles.flowStepEnd}>Pays via BSB details</i>
          <span className={styles.flowStepEndCaption}>Built-in flow only</span>
        </div>
      </div>
    </div>
  );
}
