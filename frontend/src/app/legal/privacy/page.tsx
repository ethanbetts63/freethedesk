import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";

import { LegalDocument } from "@/components/legal/LegalDocument";
import { PageSchema } from "@/components/PageSchema";
import { metadataFor } from "@/lib/pages";

export const metadata: Metadata = metadataFor("/legal/privacy");

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageSchema path="/legal/privacy" />

      <Breadcrumbs path="/legal/privacy" />
      <LegalDocument filename="privacy-policy.md" />
    </>
  );
}
