import { ServiceScroll } from "@/components/ServiceScroll";

import { dealerServices } from "./dealerServices";

export function DealershipAutomation() {
  return (
    <section className="shell" id="dealership-automation">
      <ServiceScroll
        services={dealerServices}
        customHref="#project-enquiry"
        ctaLabel="Discuss your dealership"
        eyebrow="Dealership automation"
        title="What we can automate across your dealership."
      />
    </section>
  );
}
