import { ServiceScroll } from "@/components/ServiceScroll";

import { dealerServices } from "./dealerServices";

export function DealershipAutomation({ eyebrow }: { eyebrow: string }) {
  return (
    <section className="shell" id="services">
      <ServiceScroll
        services={dealerServices}
        customHref="#project-enquiry"
        ctaLabel="Discuss your dealership"
        eyebrow={eyebrow}
        title="Features we can build in."
        showCustomCta={false}
      />
    </section>
  );
}
