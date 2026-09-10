import type { Metadata } from "next";

import { PageSchema } from "@/components/PageSchema";
import { metadataFor } from "@/lib/pages";

import { ProjectEnquiry } from "@/components/marketing/ProjectEnquiry";

export const metadata: Metadata = metadataFor("/contact");

export default function ContactPage() {
  return (
    <main>
      <PageSchema path="/contact" />
      <ProjectEnquiry id="contact-form" />
    </main>
  );
}
