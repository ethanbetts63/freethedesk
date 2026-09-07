import type { Metadata } from "next";

import { FlowHeroConcept } from "../home-v3/FlowHeroConcept";
import { Faq } from "@/components/Faq";
import { PageSchema } from "@/components/PageSchema";
import { ProofStrip, type ProofStat } from "@/components/ProofStrip";
import { pageMetadata } from "@/lib/seo";
import { ServiceScroll } from "@/components/ServiceScroll";
import { automationServices } from "./automationServices";

const TITLE = "Automate Boring Away";
const DESCRIPTION = "Practical workflow automation and custom integrations for Australian small and medium businesses.";
const PATH = "/automation";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

const questions = [
  ["What counts as something worth automating?", "Anything copied, chased or checked by hand every week—re-entering data between systems, manual status updates, or repeated follow-ups."],
  ["Will this replace the software we already use?", "Usually not. We start with the accounting, CRM, inventory or job-management systems you already run and add the missing workflow or integration, rather than replacing what already works."],
  ["How do we know it's actually working?", "Every workflow launches with monitoring and documentation, so what it saves is measured, not assumed."],
  ["How do we get started?", "Describe the process in plain English—we'll help you work out whether it's worth automating before any development begins."],
];

const automationStats: [ProofStat, ProofStat, ProofStat] = [
  { value: "36%", label: "Of the work week", description: "Time small business owners lose to manual admin tasks." },
  { value: "0", label: "Times re-keyed", description: "Information entered once, reused everywhere it's needed." },
  { value: "AI", label: "Automation like never before", description: "What AI can automate has grown fast. Get ahead of the curve." },
];

export default function AutomationPage() {
  return (
    <main>
      <PageSchema title={TITLE} description={DESCRIPTION} path={PATH} />
      <FlowHeroConcept
        eyebrow="Automate Boring Away"
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
          <h2>What gets copied, chased or checked every week?</h2>
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

      <section className="approach-section">
        <div className="shell approach-inner">
          <p className="section-number section-number-light">02 / Our approach</p>
          <h2>Start small.<br /><span className="ai-ready-ai">Dream big.</span></h2>
          <p className="approach-lead">Every business has more automation opportunities than time. We start with the simplest ones—fast to prove, low risk, and the quickest way to learn how your business works—then take on the bigger, higher-impact projects.</p>
          <ol className="approach-steps">
            <li className="approach-step">
              <div className="approach-step-rail">
                <span className="approach-step-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
                    <circle cx="12" cy="9.5" r="2.4" stroke="#fff" strokeWidth="1.6" />
                  </svg>
                </span>
                <span className="approach-step-line" />
              </div>
              <div className="approach-step-body">
                <span className="approach-step-index">01</span>
                <h3>Map it</h3>
                <p>We map every opportunity in the business, from quick fixes to big-ticket projects.</p>
              </div>
            </li>
            <li className="approach-step">
              <div className="approach-step-rail">
                <span className="approach-step-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                    <path d="M14.7 6.3a3.5 3.5 0 0 0-4.6 4.6L4 17l3 3 6.1-6.1a3.5 3.5 0 0 0 4.6-4.6l-2.3 2.3-2-2 2.3-2.3Z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="approach-step-line" />
              </div>
              <div className="approach-step-body">
                <span className="approach-step-index">02</span>
                <h3>Build it</h3>
                <p>We start with the simplest one first—fast to build and low risk, and it teaches us your business.</p>
              </div>
            </li>
            <li className="approach-step">
              <div className="approach-step-rail">
                <span className="approach-step-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                    <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="#fff" />
                  </svg>
                </span>
              </div>
              <div className="approach-step-body">
                <span className="approach-step-index">03</span>
                <h3>Learn</h3>
                <p>With trust and understanding in place, we move on to the bigger automations.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <Faq
        eyebrow="03 / Common questions"
        title="Before we start."
        items={questions.map(([question, answer]) => ({ question, answer }))}
      />
    </main>
  );
}

