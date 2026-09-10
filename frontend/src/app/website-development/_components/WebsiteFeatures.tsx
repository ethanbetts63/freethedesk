import { ServiceScroll } from "@/components/ServiceScroll";

import { websiteServices } from "./websiteServices";
import styles from "./WebsiteFeatures.module.css";

export function WebsiteFeatures({ eyebrow }: { eyebrow: string }) {
  return (
    <section className={styles.section} id="services">
      <div className="shell">
        <ServiceScroll
          services={websiteServices}
          customHref="#enquiry"
          ctaLabel="Discuss your website"
          eyebrow={eyebrow}
          title="Features we can build in."
          showCustomCta={false}
        />
      </div>
    </section>
  );
}
