import styles from "./SeoStepsBar.module.css";

const steps = ["Analyze", "Report", "Improve"] as const;

export function SeoStepsBar() {
  return (
    <section className={styles.section} id="seo-hero-end" aria-label="Our three-step SEO process">
      <div className="shell">
        <ol className={styles.steps}>
          {steps.map((step) => (
            <li key={step}>
              <span className={step === "Improve" ? "moving-colour-text" : undefined}>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
