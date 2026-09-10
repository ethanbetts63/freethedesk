import { SectionNumber } from "@/components/SectionNumber";
import { ScrollCtaButton } from "@/components/ScrollCtaButton";

import styles from "./WebsiteIntroduction.module.css";

export function WebsiteIntroduction() {
  return (
    <section className={`shell ${styles.section}`} id="website-overview" aria-labelledby="website-intro-title">
      <SectionNumber>What we build</SectionNumber>
      <h2 id="website-intro-title">
        Three jobs. <span className="moving-colour-text">One website.</span>
      </h2>
      <div className={styles.columns}>
        <div>
          <h3>1. SEO</h3>
          <p>
            Search engine optimisation (SEO) helps your website appear when people search Google for what your business
            offers.
          </p>
          <ScrollCtaButton className={styles.link} targetId="seo">
            Explore SEO <span aria-hidden="true">↘</span>
          </ScrollCtaButton>
        </div>
        <div>
          <h3>2. Website design</h3>
          <p>
            Clear layouts and simple steps guide visitors towards a purchase, booking or enquiry, on mobile and desktop.
          </p>
          <ScrollCtaButton className={styles.link} targetId="customer-journeys">
            Explore website design <span aria-hidden="true">↘</span>
          </ScrollCtaButton>
        </div>
        <div>
          <h3>3. Admin automation</h3>
          <p>
            We connect your website to your business tools to automate data entry, confirmations, invoices and
            follow-ups.
          </p>
          <ScrollCtaButton className={styles.link} targetId="website-automation">
            Explore automation <span aria-hidden="true">↘</span>
          </ScrollCtaButton>
        </div>
      </div>
    </section>
  );
}
