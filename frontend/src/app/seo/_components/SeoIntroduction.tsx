import { SectionNumber } from "@/components/SectionNumber";

import styles from "./SeoIntroduction.module.css";

const steps = [
  {
    title: "Analyze",
    description: "We analyze your search data to inspect what is helping or hurting visibility.",
  },
  {
    title: "Report",
    description: "We turn our conclusions into a ranked, plain-English list of actionable options.",
  },
  {
    title: "Improve",
    description: "You update your site to incorporate your preferred recommendations.",
  },
] as const;

export function SeoIntroduction() {
  return (
    <section className={`shell ${styles.section}`} id="seo-overview" aria-labelledby="seo-intro-title">
      <SectionNumber>How recurring SEO works</SectionNumber>
      <h2 id="seo-intro-title">
        Better data. <span className="moving-colour-text">Better decisions.</span>
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
