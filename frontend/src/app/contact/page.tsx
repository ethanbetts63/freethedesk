import type { Metadata } from "next";

import { FlowHeroConcept } from "../home-v3/FlowHeroConcept";
import { ContactEnquiry } from "./ContactEnquiry";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to Free the Desk about a custom website, online licensing product, web application or business automation project.",
};

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

      <section className="contact-page" id="contact-form">
        <div className="shell">
          <ContactEnquiry />
        </div>
      </section>
    </main>
  );
}
