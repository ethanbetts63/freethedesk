import styles from "./AutomationStepsBar.module.css";

const steps = ["Identify", "Budget", "Automate"] as const;

export function AutomationStepsBar() {
  return (
    <section className={styles.section} id="automation-hero-end" aria-label="Our three-step automation process">
      <div className="shell">
        <ol className={styles.steps}>
          {steps.map((step) => (
            <li key={step}>
              <span className={step === "Automate" ? "moving-colour-text" : undefined}>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
