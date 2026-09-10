import styles from "./ProcessStepsBar.module.css";

export function ProcessStepsBar({
  steps,
  id,
  ariaLabel,
  accentStep = steps.at(-1),
}: {
  steps: readonly string[];
  id: string;
  ariaLabel: string;
  accentStep?: string;
}) {
  return (
    <section className={styles.section} id={id} aria-label={ariaLabel}>
      <div className="shell">
        <ol className={styles.steps}>
          {steps.map((step) => (
            <li key={step}>
              <span className={step === accentStep ? "moving-colour-text" : undefined}>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
