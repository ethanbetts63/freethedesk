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

      <div className={styles.topRail} aria-hidden="true">
        <span>FTD.AI / READINESS</span>
        <span><i /> Diagnostic online</span>
        <span>4 signal protocol</span>
      </div>

      <div className={styles.console} aria-label="AI readiness diagnostic preview">
        <header>
          <span><i /> Example diagnostic</span>
          <b>SCAN / 04 SIGNALS</b>
        </header>

        <div className={styles.scanner} aria-hidden="true">
          <span className={`${styles.metric} ${styles.metricOne}`}>DOM <b>1,274</b></span>
          <span className={`${styles.metric} ${styles.metricTwo}`}>CLS <b>0.04</b></span>
          <span className={`${styles.metric} ${styles.metricThree}`}>BOT <b>ALLOW</b></span>
          <svg className={styles.network} viewBox="0 0 430 230" preserveAspectRatio="none">
            <path d="M35 62 118 38 205 112 309 48 394 84M45 178l73-52 87-14 102 70 87-48M118 38v88m87-14v82M309 48l-2 134M35 62l10 116m349-94v50" />
            <circle cx="35" cy="62" r="4" /><circle cx="45" cy="178" r="4" />
            <circle cx="118" cy="38" r="5" /><circle cx="118" cy="126" r="4" />
            <circle cx="205" cy="112" r="6" /><circle cx="205" cy="194" r="4" />
            <circle cx="309" cy="48" r="5" /><circle cx="307" cy="182" r="4" />
            <circle cx="394" cy="84" r="4" /><circle cx="394" cy="134" r="4" />
          </svg>
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
        <p className={styles.eyebrow}><i /> Optional AI readiness check</p>
        <h3 id="ai-readiness-title">Can AI systems<br /><span>read your site?</span></h3>
        <p className={styles.intro}>
          A focused technical check for the parts of your website that AI agents and answer
          engines depend on before they can understand, navigate or cite it reliably.
        </p>

        <ul className={styles.outputs}>
          <li>Four checks explained in plain English</li>
          <li>Pass, warning or blocked for every signal</li>
          <li>A prioritised fix list for anything that fails</li>
        </ul>

        <div className={styles.offer}>
          <span><small>Standalone check</small><strong>{standalonePrice}</strong><em>once</em></span>
          <span><small>With any SEO report</small><strong>Included free</strong></span>
        </div>

        <Link className={styles.cta} href="/contact">
          Check my site <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
