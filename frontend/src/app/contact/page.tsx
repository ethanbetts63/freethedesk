import type { Metadata } from "next";

import { PageSchema } from "@/components/PageSchema";
import { metadataFor } from "@/lib/pages";

import { AiReadinessBanner } from "@/components/marketing/AiReadinessBanner";
import { ProjectEnquiry } from "@/components/marketing/ProjectEnquiry";

export const metadata: Metadata = metadataFor("/contact");

export default function ContactPage() {
  return (
    <main>
      <PageSchema path="/contact" />
      <AiReadinessBanner />
      <ProjectEnquiry id="contact-form" />
    </main>
  );
}
