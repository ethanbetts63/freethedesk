import { ServiceScroll } from "@/components/ServiceScroll";

import { dealerServices } from "./dealerServices";

/** Dealer-specific automation pitch on /dealers, above the budget enquiry panel. */
export function DealershipAutomation() {
  return (
    <>
      <section className="section shell intro-section">
        <div>
          <p className="eyebrow">
            <span /> Dealership automation
          </p>
          <h2>The systems that keep a sales floor moving.</h2>
        </div>
        <p className="section-intro">
          The same connected systems, aimed at what actually eats a dealership&apos;s week: enquiries, licensing
          paperwork, delivery handoffs and the emails your team writes every day.
        </p>
      </section>

      <section className="shell" id="dealership-automation">
        <ServiceScroll services={dealerServices} customHref="#project-enquiry" />
      </section>
    </>
  );
}
