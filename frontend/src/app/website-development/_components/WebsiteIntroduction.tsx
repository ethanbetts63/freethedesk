import { SectionNumber } from "@/components/SectionNumber";
import { ScrollCtaButton } from "@/components/ScrollCtaButton";

import styles from "./WebsiteIntroduction.module.css";

export function WebsiteIntroduction({
  id = "website-overview",
  seoDescription = "Search engine optimisation (SEO) helps your website appear when people search Google for what your business offers.",
  designDescription = "Clear layouts and simple steps guide visitors towards a purchase, booking or enquiry, on mobile and desktop.",
  automationDescription = "We connect your website to your business tools to automate data entry, confirmations, invoices and follow-ups.",
}: {
  id?: string;
  seoDescription?: string;
  designDescription?: string;
  automationDescription?: string;
}) {
  return (
    <section className={`shell ${styles.section}`} id={id} aria-labelledby={`${id}-title`}>
      <SectionNumber>What we build</SectionNumber>
      <h2 id={`${id}-title`}>
        Three jobs. <span className="moving-colour-text">One website.</span>
      </h2>
      <div className={styles.columns}>
        <div>
          <h3>1. SEO</h3>
          <p>{seoDescription}</p>
          <ScrollCtaButton className={styles.link} targetId="seo">
            Explore SEO <span aria-hidden="true">↘</span>
          </ScrollCtaButton>
        </div>
        <div>
          <h3>2. Website design</h3>
          <p>{designDescription}</p>
          <ScrollCtaButton className={styles.link} targetId="customer-journeys">
            Explore website design <span aria-hidden="true">↘</span>
          </ScrollCtaButton>
        </div>
        <div>
          <h3>3. Admin automation</h3>
          <p>{automationDescription}</p>
          <ScrollCtaButton className={styles.link} targetId="website-automation">
            Explore automation <span aria-hidden="true">↘</span>
          </ScrollCtaButton>
        </div>
      </div>
    </section>
  );
}
