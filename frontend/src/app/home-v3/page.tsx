import type { Metadata } from "next";
import Link from "next/link";

import { NetworkField } from "./NetworkField";
import { SignalFlow } from "./SignalFlow";
import { FlagshipCheckout } from "./FlagshipCheckout";
import { WebsiteProduct } from "./WebsiteProduct";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Home V3",
  description: "A connected, intelligent operations concept for Free the Desk.",
};

export default function HomeV3() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.glow} />
        <div className={styles.network}><NetworkField /></div>
        <div className={styles.grid} />

        <div className={`shell ${styles.content}`}>
          <p className={styles.eyebrow}><span /> Systems that think ahead</p>
          <h1>Digital<br /><em>dealerships.</em></h1>
          <p className={styles.lead}>
            Connected websites and operational systems built for the way modern dealerships sell, service and work.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primary} href="/contact">Build your system <span>↗</span></Link>
            <Link className={styles.secondary} href="/work/scooter-shop">See it in action <span>→</span></Link>
          </div>
        </div>

        <div className={styles.signal} aria-hidden="true">
          <span className={styles.signalDot} />
          <span>Network active</span>
          <b>24 / 7</b>
        </div>

        <p className={styles.hint}>Move your cursor to explore the network</p>
      </section>

      <section className={styles.flowHero}>
        <div className={styles.flow}><SignalFlow /></div>
        <div className={styles.flowGrid} />
        <div className={styles.flowFade} />

        <div className={`shell ${styles.flowLayout}`}>
          <div className={styles.flowCopy}>
            <p className={styles.flowKicker}>Systems that think ahead</p>
            <h2>Digital<br /><span>dealerships.</span></h2>
            <p className={styles.flowLead}>
              Connected websites and operational systems built for the way modern dealerships sell, service and work.
            </p>
            <div className={styles.flowActions}>
              <Link href="/contact">Build your system <span>↗</span></Link>
              <Link href="/work/scooter-shop">See it in action <span>→</span></Link>
            </div>
          </div>

          <div className={styles.readout} aria-hidden="true">
            <div><span>01</span><p>Customer</p></div>
            <div><span>02</span><p>System</p></div>
            <div><span>03</span><p>Team</p></div>
            <div><span>04</span><p>Done</p></div>
          </div>
        </div>
      </section>

      <FlagshipCheckout />
      <WebsiteProduct />
    </main>
  );
}
