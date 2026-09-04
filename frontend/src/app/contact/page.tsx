import type { Metadata } from "next";

import { FlowHeroConcept } from "../home-v3/FlowHeroConcept";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to Free the Desk about a dealer website, operational system or business automation project.",
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
      <div className="shell contact-grid">
        <div className="contact-copy">
          <p className="section-number">Tell us what is getting in the way</p>
          <h2>Show us the hard part.</h2>
          <div className="contact-detail"><span>01</span><div><strong>Website projects</strong><p>Tell us what you sell, which departments are involved and where the current site falls short.</p></div></div>
          <div className="contact-detail"><span>02</span><div><strong>Automation projects</strong><p>Describe the repeated task, who does it and which systems or spreadsheets are involved.</p></div></div>
          <div className="contact-direct"><small>Prefer email?</small><a href="mailto:hello@freethedesk.com.au">hello@freethedesk.com.au</a><span>Perth based · Working Australia-wide</span></div>
        </div>
        <div className="contact-form-wrap">
          <h2>Tell us about the business.</h2>
          <p>No polished brief needed. Start with the problem.</p>
          <ContactForm />
        </div>
      </div>
      </section>
    </main>
  );
}
