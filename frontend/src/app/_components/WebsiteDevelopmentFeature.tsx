import Link from "next/link";

import styles from "./WebsiteDevelopmentFeature.module.css";

export function WebsiteDevelopmentFeature() {
  return (
    <section className={styles.section}>
      <div className={`shell ${styles.layout}`}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}><span /> Website development</p>
          <h2>Websites that<br /><em>work harder.</em></h2>
          <p className={styles.lead}>Custom websites and applications that automate the repetitive work behind your business.</p>
          <ul>
            <li>Conversion-first customer journeys</li>
            <li>Useful tools for customers and staff</li>
            <li>Integrations that remove repeated admin</li>
          </ul>
          <Link href="/website-development">Explore website development <span>→</span></Link>
        </div>

        <div className={styles.visual} aria-hidden="true">
          <div className={styles.browserBar}>
            <div><i /><i /><i /></div>
            <span>yourbusiness.com.au</span>
            <b>Live</b>
          </div>
          <div className={styles.websiteCanvas}>
            <nav><strong>your<span>business</span>.</strong><div><i /><i /><b /></div></nav>
            <div className={styles.pageHero}>
              <small>A clear path forward</small>
              <strong>Make the next<br />step obvious.</strong>
              <span>Get started →</span>
            </div>
            <div className={styles.pageCards}><i /><i /><i /></div>
          </div>
          <div className={styles.systemPanel}>
            <header><span>Behind the website</span><b>Working</b></header>
            <div><i>01</i><span>Form routed</span><strong>Done</strong></div>
            <div><i>02</i><span>CRM updated</span><strong>Done</strong></div>
            <div><i>03</i><span>Follow-up sent</span><strong>Done</strong></div>
          </div>
        </div>
      </div>
    </section>
  );
}
