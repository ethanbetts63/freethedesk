import { ServiceScroll } from "@/components/ServiceScroll";

import { dealerServices } from "./dealerServices";

export function DealershipAutomation() {
  return (
    <section className="shell" id="dealership-automation">
      <ServiceScroll
        services={dealerServices}
        customHref="#project-enquiry"
        eyebrow="Dealership automation"
        title="The systems that keep a sales floor moving."
        ctaLabel="Tell us your budget"
      />
    </section>
  );
}
