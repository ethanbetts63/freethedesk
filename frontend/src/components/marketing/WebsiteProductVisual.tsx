import Image from "next/image";

import styles from "./WebsiteProductVisual.module.css";

export function WebsiteProductVisual() {
  return (
    <div className={styles.visual}>
      <div className={styles.browser} aria-hidden="true">
        <div className={styles.browserTop}>
          <div>
            <i />
            <i />
            <i />
          </div>
          <span>yourdealership.com.au</span>
          <b>Live preview</b>
        </div>
        <div className={styles.siteNav}>
          <strong>
            north<span>line</span>.
          </strong>
          <div>
            <span>Stock</span>
            <span>Service</span>
            <span>About</span>
            <b>Contact</b>
          </div>
        </div>
        <div className={styles.siteHero}>
          <div>
            <small>New arrivals / 2026</small>
            <h3>
              Find your
              <br />
              next machine.
            </h3>
            <p>Explore the latest vehicles, buy online or speak with the team.</p>
            <span className={styles.previewButton}>View inventory →</span>
          </div>
          <div className={styles.previewVehicle}>
            <Image
              className={styles.previewVehicleImage}
              src="/images/car.png"
              alt=""
              width={520}
              height={262}
              aria-hidden="true"
            />
          </div>
        </div>
        <div className={styles.inventoryStrip}>
          <span>Latest inventory</span>
          <div>
            <i />
            <i />
            <i />
          </div>
          <b>View all 24 →</b>
        </div>
      </div>
    </div>
  );
}
