import Link from "next/link";

import { NetworkField } from "./NetworkField";
import styles from "./page.module.css";

export function HomeHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.glow} />
      <div className={styles.network}><NetworkField /></div>
      <div className={styles.grid} />
      <div className={`shell ${styles.content}`}>
        <p className={styles.eyebrow}><span /> Systems that think ahead</p>
        <h1>Digital<br /><em>dealerships.</em></h1>
        <p className={styles.lead}>Connected websites and operational systems built for the way modern dealerships sell, service and work.</p>
        <div className={styles.actions}><Link className={styles.primary} href="/dealership-website-builder">Try the Free Demo <span>↗</span></Link><Link className={styles.secondary} href="/work/scooter-shop">See it in action <span>→</span></Link></div>
      </div>
      <div className={styles.signal} aria-hidden="true"><span className={styles.signalDot} /><span>Network active</span><b>24 / 7</b></div>
      <p className={styles.hint}>Move your cursor to explore the network</p>
    </section>
  );
}
