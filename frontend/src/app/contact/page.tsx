import type { Metadata } from "next";

import { PageSchema } from "@/components/PageSchema";
import { metadataFor } from "@/lib/pages";

import { ContactEnquiry } from "@/components/marketing/ContactEnquiry";

export const metadata: Metadata = metadataFor("/contact");

export default function ContactPage() {
  return (
    <main>
      <PageSchema path="/contact" />
      <section className="contact-page" id="contact-form">
        <div className="shell">
          <ContactEnquiry />
        </div>
      </section>
    </main>
  );
}
