import type { Metadata } from "next";

import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to Free the Desk about a dealer website, operational system or business automation project.",
};

export default function ContactPage() {
  return (
    <main className="contact-page">
      <section className="shell contact-grid">
        <div className="contact-copy">
          <p className="eyebrow"><span />Start a conversation</p>
          <h1>Show us what your dealership is doing the hard way.</h1>
          <p className="hero-lead">A website URL and a plain-English explanation are enough to begin. We’ll review the business and come back with useful questions.</p>
          <div className="contact-detail"><span>01</span><div><strong>Website projects</strong><p>Tell us what you sell, which departments are involved and where the current site falls short.</p></div></div>
          <div className="contact-detail"><span>02</span><div><strong>Automation projects</strong><p>Describe the repeated task, who does it and which systems or spreadsheets are involved.</p></div></div>
          <div className="contact-direct"><small>Prefer email?</small><a href="mailto:hello@freethedesk.com.au">hello@freethedesk.com.au</a><span>Perth based · Working Australia-wide</span></div>
        </div>
        <div className="contact-form-wrap">
          <h2>Tell us about the business.</h2>
          <p>No polished brief needed. Start with the problem.</p>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
