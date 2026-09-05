import type { Metadata } from "next";

import { ContactEnquiry } from "./ContactEnquiry";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to Free the Desk about a custom website, online licensing product, web application or business automation project.",
};

export default function ContactPage() {
  return (
    <main>
      <section className="contact-page" id="contact-form">
        <div className="shell">
          <ContactEnquiry />
        </div>
      </section>
    </main>
  );
}
