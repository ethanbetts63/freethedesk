import type { Metadata } from "next";

import { FlowHeroConcept } from "../home-v3/FlowHeroConcept";
import { ProofStrip, type ProofStat } from "@/components/ProofStrip";
import { ContactEnquiry } from "./ContactEnquiry";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to Free the Desk about a custom website, online licensing product, web application or business automation project.",
};

const contactStats: [ProofStat, ProofStat, ProofStat] = [
  { value: "78%", label: "Win by responding first", description: "Of customers buy from whichever business replies to their enquiry first." },
  { value: "24h", label: "Reply time", description: "We review and respond to every enquiry within one business day." },
  { value: "1", label: "Form, not a maze", description: "The business and the problem—that's what we need to start." },
];

export default function ContactPage() {
  return (
    <main>
      <FlowHeroConcept
        eyebrow="Start a conversation"
        title="Start with"
        accentTitle="the problem."
        lead="A website URL and a plain-English explanation are enough. We will review the business and come back with useful questions."
        primaryHref="#contact-form"
        primaryLabel="Tell us about it"
        secondaryHref="mailto:hello@freethedesk.com.au"
        secondaryLabel="Email us"
        stages={["Website", "Problem", "Review", "Next step"]}
      />

      <ProofStrip stats={contactStats} />

      <section className="contact-page" id="contact-form">
        <div className="shell">
          <ContactEnquiry />
        </div>
      </section>
    </main>
  );
}
