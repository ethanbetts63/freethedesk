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
        lead="The same connected systems, aimed at what actually eats a dealership's week: enquiries, licensing paperwork, delivery handoffs and the emails your team writes every day."
        ctaLabel="Tell us your budget"
      />
    </section>
  );
}
