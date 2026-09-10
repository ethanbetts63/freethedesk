import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";

import { LegalDocument } from "@/components/legal/LegalDocument";
import { PageSchema } from "@/components/PageSchema";
import { metadataFor } from "@/lib/pages";

export const metadata: Metadata = metadataFor("/legal/seo-subscription-terms");

export default function SeoSubscriptionTermsPage() {
  return (
    <>
      <PageSchema path="/legal/seo-subscription-terms" />

      <Breadcrumbs path="/legal/seo-subscription-terms" />
      <LegalDocument filename="seo-subscription-terms.md" />
    </>
  );
}
