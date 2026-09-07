import Link from "next/link";

import styles from "./WebsiteProduct.module.css";

export function WebsiteProduct() {
  return (
    <section className={styles.section} id="dealer-websites">
      <div className={`shell ${styles.layout}`}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}><span /> Interactive website builder</p>
          <h2>Digital Dealer<br /><em>Demo.</em></h2>
          <p className={styles.lead}>
            Shape a complete dealership website around your brand. Choose the capabilities you need, then explore every page as the demo changes in real time.
          </p>

          <div className={styles.actions}>
            <Link className={styles.primary} href="/dealership-website-builder">
              Configure now <span>→</span>
            </Link>
            <a className={styles.dealerExample} href="https://www.scootershop.com.au" target="_blank" rel="noreferrer">
              <small>See a complete dealer example</small>
              <strong>www.scootershop.com.au <span>↗</span></strong>
            </a>
          </div>
        </div>

        <div className={styles.visual}>
          <div className={styles.visualLabel}>
            <span>Live website preview</span>
            <b>Interactive</b>
          </div>

          <div className={styles.browser} aria-hidden="true">
            <div className={styles.browserTop}>
              <div><i /><i /><i /></div>
              <span>yourdealership.com.au</span>
              <b>Live preview</b>
            </div>
            <div className={styles.siteNav}>
              <strong>north<span>line</span>.</strong>
              <div><span>Stock</span><span>Service</span><span>About</span><b>Contact</b></div>
            </div>
            <div className={styles.siteHero}>
              <div>
                <small>New arrivals / 2026</small>
                <h3>Find your<br />next machine.</h3>
                <p>Explore the latest vehicles, buy online or speak with the team.</p>
                <span className={styles.previewButton}>View inventory →</span>
              </div>
              <div className={styles.previewVehicle}>
                <span /><i /><i />
              </div>
            </div>
            <div className={styles.inventoryStrip}>
              <span>Latest inventory</span>
              <div><i /><i /><i /></div>
              <b>View all 24 →</b>
            </div>
          </div>

          <div className={styles.visualSteps}>
            <span><b>01</b> Customise</span>
            <span><b>02</b> Interact</span>
            <span><b>03</b> Explore</span>
          </div>
        </div>
      </div>
    </section>
  );
}
