import type { Metadata } from "next";

import { PageSchema } from "@/components/PageSchema";
import { pageMetadata } from "@/lib/seo";

import { ContactEnquiry } from "@/components/marketing/ContactEnquiry";

const TITLE = "Contact";
const DESCRIPTION = "Talk to Free the Desk about a custom website, online licensing product, web application or business automation project.";
const PATH = "/contact";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function ContactPage() {
  return (
    <main>
      <PageSchema title={TITLE} description={DESCRIPTION} path={PATH} />
      <section className="contact-page" id="contact-form">
        <div className="shell">
          <ContactEnquiry />
        </div>
      </section>
    </main>
  );
}
