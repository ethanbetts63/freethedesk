import Link from "next/link";

import { VortexField } from "./VortexField";
import styles from "./page.module.css";

function HeroCopy() {
  return (
    <div className={`shell ${styles.copy}`}>
      <p className={styles.eyebrow}><span /> Systems that think ahead</p>
      <h1>Digital<br /><em>dealerships.</em></h1>
      <p className={styles.lead}>Connected websites and operational systems built for the way modern dealerships sell, service and work.</p>
      <div className={styles.actions}>
        <Link className={styles.primary} href="/dealership-website-builder">Try the Free Demo <span>↗</span></Link>
        <Link className={styles.secondary} href="/work/scooter-shop">See it in action <span>→</span></Link>
      </div>
    </div>
  );
}

export function VortexHero() {
  return (
    <section className={`${styles.hero} ${styles.vortexHero}`}>
      <VortexField />
      <div className={styles.vortexFade} />
      <HeroCopy />
    </section>
  );
}
