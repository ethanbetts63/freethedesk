import { SectionNumber } from "@/components/SectionNumber";

import styles from "../page.module.css";

export function LicensingJourneyComparison({ eyebrow }: { eyebrow: string }) {
  return (
    <section className={styles.comparisonSection} id="shorter-path">
      <div className={`shell ${styles.comparison}`}>
        <div className={styles.comparisonCopy}>
          <SectionNumber>{eyebrow}</SectionNumber>
          <h2>Cut six steps down to four.</h2>
          <p>Remove the steps that add effort without adding value to the customer or the dealership.</p>
        </div>
        <div className={styles.paths}>
          <article>
            <header>
              <span>Traditional</span>
              <b>6 steps</b>
            </header>
            <div>
              <span>Ready to buy</span>
              <i /> <span>Arrange visit</span>
              <i /> <span>Travel</span>
              <i /> <span>Wait</span>
              <i /> <span>Sign</span>
              <i /> <strong>Handover</strong>
            </div>
          </article>
          <article className={styles.onlinePath}>
            <header>
              <span>Online</span>
              <b>4 steps</b>
            </header>
            <div>
              <span>Choose</span>
              <i /> <span>Sign</span>
              <i /> <span>Pay</span>
              <i /> <strong>Delivery / pickup</strong>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
