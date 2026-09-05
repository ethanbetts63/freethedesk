import type { Metadata } from "next";
import Link from "next/link";

import { FlowHeroConcept } from "../home-v3/FlowHeroConcept";
import { ProofStrip, type ProofStat } from "@/components/ProofStrip";
import { ServiceScroll } from "@/components/ServiceScroll";
import { automationServices } from "./automationServices";

export const metadata: Metadata = {
  title: "Business Automation",
  description: "Practical workflow automation and custom integrations for Australian small and medium businesses.",
};

const automationStats: [ProofStat, ProofStat, ProofStat] = [
  { value: "36%", label: "Of the work week", description: "Time small business owners lose to manual admin tasks, per Xero research." },
  { value: "0", label: "Times re-keyed", description: "Information entered once, reused everywhere it's needed." },
  { value: "AI", label: "Automation like never before", description: "What AI can automate has grown fast—broader, smarter and easier to build than it was a year ago." },
];

export default function AutomationPage() {
  return (
    <main>
      <FlowHeroConcept
        eyebrow="Business automation"
        title="Less repetition."
        accentTitle="More progress."
        lead="We connect the systems you already use and build the missing pieces, so information moves while your team stays focused on customers."
        primaryHref="/contact"
        primaryLabel="Find your first automation"
        secondaryHref="#workflows"
        secondaryLabel="Explore workflows"
        stages={["Capture", "Connect", "Action", "Done"]}
      />

      <ProofStrip stats={automationStats} />

      <section className="shell automation-intro">
        <p className="section-number">01 / Practical automation</p>
        <div className="automation-intro-row">
          <h2>Start with the friction already costing time.</h2>
          <div className="automation-intro-shapes" aria-hidden="true">
            <i style={{ background: "var(--blue-500)" }} />
            <i style={{ background: "var(--blue-700)" }} />
            <i style={{ background: "var(--blue-900)" }} />
            <i style={{ background: "var(--accent-strong)" }} />
          </div>
        </div>
      </section>

      <section className="shell" id="workflows">
        <ServiceScroll services={automationServices} />
      </section>

      <section className="section lime-band">
        <div className="shell split-content split-content-dark">
          <div><p className="section-number">02 / Our approach</p><h2>Improve what works. Replace only what does not.</h2></div>
          <div><p>Most businesses already have useful accounting, CRM, inventory or job-management software. We begin with those systems and add the workflow, interface or integration that is missing.</p><ul className="check-list check-list-dark"><li>Process mapped before tools are chosen</li><li>Error handling and monitoring included</li><li>Human approval at consequential steps</li><li>Documented handover and clear ownership</li></ul></div>
        </div>
      </section>

      <section className="section shell process-section">
        <div className="process-heading"><p className="section-number">03 / Delivery</p><h2>One useful workflow, working properly.</h2></div>
        <div className="process-grid">
          <article><span>01</span><h3>Map it</h3><p>Walk through the current process, exceptions, systems and cost of the repeated work.</p></article>
          <article><span>02</span><h3>Prove it</h3><p>Build and test a focused workflow with realistic data and the staff who will use it.</p></article>
          <article><span>03</span><h3>Run it</h3><p>Launch with monitoring, documentation and support, then measure what it actually saves.</p></article>
        </div>
      </section>

      <section className="shell closing-cta">
        <p className="eyebrow eyebrow-light"><span />A good place to start</p>
        <h2>What gets copied, chased or checked every week?</h2>
        <p>Describe the process in plain English. We’ll help you identify whether it is worth automating.</p>
        <Link className="button button-lime" href="/contact">Tell us what eats the time <span>↗</span></Link>
      </section>
    </main>
  );
}

