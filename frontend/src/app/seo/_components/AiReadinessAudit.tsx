import Link from "next/link";

import styles from "./AiReadinessAudit.module.css";

const SIGNALS = [
  ["01", "Accessibility tree"],
  ["02", "Stable layout"],
  ["03", "llms.txt"],
  ["04", "Crawler access"],
] as const;

export function AiReadinessAudit({ standalonePrice }: { standalonePrice: string }) {
  return (
    <section className={styles.audit} aria-labelledby="ai-readiness-title">
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.beam} aria-hidden="true" />

      <div className={styles.console} aria-label="AI readiness diagnostic preview">
        <header>
          <span><i /> Example diagnostic</span>
          <b>SCAN / 04 SIGNALS</b>
        </header>

        <div className={styles.scanner} aria-hidden="true">
          <span className={`${styles.metric} ${styles.metricOne}`}>DOM <b>1,274</b></span>
          <span className={`${styles.metric} ${styles.metricTwo}`}>CLS <b>0.31</b></span>
          <span className={`${styles.metric} ${styles.metricThree}`}>BOT <b>BLOCKED</b></span>
          <div className={styles.core}>
            <div className={styles.orbit}><i /><i /><i /></div>
            <span>AI</span>
            <small>analysing</small>
          </div>
        </div>

        <ol className={styles.signalList}>
          {SIGNALS.map(([number, title]) => (
            <li key={title}>
              <span>{number}</span>
              <strong>{title}</strong>
              <i aria-hidden="true" />
            </li>
          ))}
        </ol>

        <footer>
          <span>Deliverable</span>
          <strong>Readiness score + prioritised fixes</strong>
          <i aria-hidden="true" />
        </footer>
      </div>

      <div className={styles.copy}>
        <h3 id="ai-readiness-title">Can AI systems<br /><span>read your site?</span></h3>
        <p className={styles.intro}>
          A focused technical check for the parts of your website that AI agents and answer
          engines like Chat GPT depend on before they can understand, navigate or cite it reliably.
        </p>

        <ul className={styles.outputs}>
          <li>Four checks explained in plain English</li>
          <li>Pass, warning or blocked for every signal</li>
          <li>A prioritised fix list for anything that fails</li>
        </ul>

        <div className={styles.offer}>
          <div className={styles.offerOption}>
            <small>Standalone check</small>
            <span className={styles.priceLine}><strong>{standalonePrice}</strong><em>once</em></span>
          </div>
          <span className={styles.offerOr}>OR</span>
          <div className={styles.offerOption}>
            <small>With every report plan</small>
            <strong>Included free</strong>
          </div>
        </div>

        <Link className={styles.cta} href="/contact">
          Check my site <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
