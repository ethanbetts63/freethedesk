import { SectionNumber } from "@/components/SectionNumber";

import styles from "./AutomationIntroduction.module.css";

const steps = [
  {
    title: "Identify",
    description: "Find the repetitive admin costing your team time every week.",
  },
  {
    title: "Budget",
    description: "Set the financial constraint so we can prioritise the most valuable automation.",
  },
  {
    title: "Automate",
    description: "Connect the tools and automate the work that does not need human judgement.",
  },
] as const;

export function AutomationIntroduction() {
  return (
    <section className={`shell ${styles.section}`} id="automation-overview" aria-labelledby="automation-intro-title">
      <SectionNumber>How we work</SectionNumber>
      <h2 id="automation-intro-title">
        Three steps. <span className="moving-colour-text">Countless hours automated.</span>
      </h2>
      <div className={styles.columns}>
        {steps.map((step) => (
          <div key={step.title}>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
