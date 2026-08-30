import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dealership Automation",
  description: "Practical workflow automation and custom integrations for Australian dealerships and equipment businesses.",
};

const workflows = [
  ["Lead handling", "Capture the product and customer context, route it to the right person and make sure the next action is visible."],
  ["Parts workflows", "Move requests from customer to parts desk, supplier and quote without losing the details in an inbox thread."],
  ["Service and bookings", "Collect better booking details, send reminders and keep customers informed at the useful moments."],
  ["Documents and data", "Generate, classify, extract or transfer information where people are currently copying and pasting."],
  ["Reporting", "Bring live operational information together so the owner sees the decision, not another spreadsheet job."],
  ["Custom integrations", "Connect systems through their APIs when an off-the-shelf connector is missing or too limited."],
];

export default function AutomationPage() {
  return (
    <main>
      <section className="automation-hero">
        <div className="shell automation-hero-grid">
          <div>
            <p className="eyebrow eyebrow-light"><span />Dealership automation</p>
            <h1>Remove the work your team should not have to repeat.</h1>
            <p className="hero-lead hero-lead-light">We connect the systems you already use and build the missing pieces, so information moves and people stay focused on customers.</p>
            <Link className="button button-lime" href="/contact">Find your first automation <span>↗</span></Link>
          </div>
          <div className="workflow-visual">
            <div className="workflow-step"><span>01</span><div><small>Customer</small><strong>Enquiry received</strong></div><b>✓</b></div>
            <div className="workflow-line"><i /></div>
            <div className="workflow-step"><span>02</span><div><small>System</small><strong>Lead enriched & routed</strong></div><b>✓</b></div>
            <div className="workflow-line"><i /></div>
            <div className="workflow-step"><span>03</span><div><small>Team</small><strong>Next action ready</strong></div><b>→</b></div>
            <p>Human judgement stays human. The repeated handovers happen automatically.</p>
          </div>
        </div>
      </section>

      <section className="section shell intro-section">
        <div><p className="section-number">01 / Practical automation</p><h2>Start with the friction already costing time.</h2></div>
        <p className="section-intro">The strongest first project is usually one repeated workflow with a clear owner, clear inputs and an obvious measure of success. It does not need “AI” in every step.</p>
      </section>

      <section className="shell capability-grid automation-capability-grid">
        {workflows.map(([title, body], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}
      </section>

      <section className="section lime-band">
        <div className="shell split-content split-content-dark">
          <div><p className="section-number">02 / Our approach</p><h2>Improve what works. Replace only what does not.</h2></div>
          <div><p>Most dealerships already have useful accounting, CRM, inventory or job-management software. We begin with those systems and add the workflow, interface or integration that is missing.</p><ul className="check-list check-list-dark"><li>Process mapped before tools are chosen</li><li>Error handling and monitoring included</li><li>Human approval at consequential steps</li><li>Documented handover and clear ownership</li></ul></div>
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

