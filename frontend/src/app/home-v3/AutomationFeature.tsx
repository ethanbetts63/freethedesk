import Link from "next/link";

import styles from "./AutomationFeature.module.css";

export function AutomationFeature() {
  return (
    <section className={styles.section}>
      <div className={`shell ${styles.layout}`}>
        <div className={styles.visual} aria-hidden="true">
          <header><span>Workflow / 01</span><b><i /> Running</b></header>
          <div className={styles.event}>
            <small>Trigger</small>
            <strong>New enquiry received</strong>
            <span>Customer + product context attached</span>
          </div>
          <div className={styles.route}><i /><i /><i /></div>
          <div className={styles.actions}>
            <article><span>01</span><strong>CRM updated</strong><small>No re-keying</small></article>
            <article><span>02</span><strong>Team notified</strong><small>Right person, instantly</small></article>
            <article><span>03</span><strong>Follow-up queued</strong><small>Nothing forgotten</small></article>
          </div>
          <footer><span>Manual touches</span><strong>0</strong><small>Workflow complete</small></footer>
        </div>

        <div className={styles.copy}>
          <p className={styles.eyebrow}><span /> Business automation</p>
          <h2>Less repetition.<br /><em>More progress.</em></h2>
          <p className={styles.lead}>We connect the systems you already use and build the missing pieces, so information moves without your team moving it by hand.</p>
          <ul>
            <li>Lead routing and follow-up</li>
            <li>Bookings, documents and data transfer</li>
            <li>Reporting built around the decision</li>
          </ul>
          <Link href="/automation">Explore business automation <span>→</span></Link>
        </div>
      </div>
    </section>
  );
}
