import Link from "next/link";

import { NetworkField } from "./NetworkField";
import styles from "./page.module.css";

type FlowHeroConceptProps = {
  eyebrow?: string;
  title?: string;
  accentTitle?: string;
  lead?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  stages?: string[];
  trustLine?: string;
};

/** Alternate hero layout, kept separate from the home hero for product pages. */
export function FlowHeroConcept({
  eyebrow = "Efficiency First Solutions",
  title = "Digital",
  accentTitle = "dealerships.",
  lead = "Connected websites and operational systems built for the way modern dealerships sell, service and work.",
  primaryHref = "/dealership-website-builder",
  primaryLabel = "Try the Free Demo",
  secondaryHref = "/work/scooter-shop",
  secondaryLabel = "See it in action",
  stages = ["Customer", "System", "Team", "Done"],
  trustLine = "Perth-based · working with businesses across Australia",
}: FlowHeroConceptProps) {
  return (
    <section className={styles.flowHero}>
      <div className={styles.flow}><NetworkField /></div>
      <div className={styles.flowGrid} />
      <div className={styles.flowFade} />
      <div className={`shell ${styles.flowLayout}`}>
        <div className={styles.flowCopy}>
          <p className={styles.flowKicker}>{eyebrow}</p>
          <h1>{title}<br /><span>{accentTitle}</span></h1>
          <p className={styles.flowLead}>{lead}</p>
          <div className={styles.flowActions}>
            <Link href={primaryHref}>{primaryLabel} <span>↗</span></Link>
            <Link href={secondaryHref}>{secondaryLabel} <span>→</span></Link>
          </div>
          {trustLine ? <p className={styles.flowTrust}>{trustLine}</p> : null}
        </div>
        <div className={styles.readout} aria-hidden="true">
          {stages.map((stage, index) => <div key={stage}><span>0{index + 1}</span><p>{stage}</p></div>)}
        </div>
      </div>
    </section>
  );
}
