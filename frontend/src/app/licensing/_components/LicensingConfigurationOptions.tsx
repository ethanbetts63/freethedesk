import Link from "next/link";

import { SectionNumber } from "@/components/SectionNumber";

import styles from "../page.module.css";
import { FlowCompare } from "./FlowCompare";
import { LicensingNextStepPhone } from "./LicensingNextStepPhone";
import { LoginPreviewPhone } from "./LoginPreviewPhone";

export function LicensingConfigurationOptions({ eyebrow }: { eyebrow: string }) {
  return (
    <section className={styles.optionsSection} id="configuration-options">
      <div className={`shell ${styles.optionsLayout}`}>
        <div className={styles.optionsHeading}>
          <SectionNumber>{eyebrow}</SectionNumber>
          <h2>
            Our portal or <span className="moving-colour-text">your website.</span>
          </h2>
          <p>
            Use the hosted product with the website you already have, or make it a seamless part of a dealership site we
            build.
          </p>
        </div>
        <div className={styles.optionPhones}>
          <div className={styles.optionPhoneTile}>
            <LoginPreviewPhone />
            <p className={styles.optionPhoneCaption}>Hosted portal</p>
          </div>
          <div className={styles.optionPhoneTile}>
            <LicensingNextStepPhone />
            <p className={styles.optionPhoneCaption}>Built into your website</p>
            <Link href="/portfolio/scooter-shop">
              See the Scooter Shop approach <b>↗</b>
            </Link>
          </div>
        </div>
      </div>
      <div className="shell">
        <FlowCompare />
      </div>
    </section>
  );
}
