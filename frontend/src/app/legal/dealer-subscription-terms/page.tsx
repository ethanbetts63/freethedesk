import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/LegalDocument";
import { PageSchema } from "@/components/PageSchema";
import { metadataFor } from "@/lib/pages";

export const metadata: Metadata = metadataFor("/legal/dealer-subscription-terms");

export default function DealerSubscriptionTermsPage() {
  return (
    <>
      <PageSchema path="/legal/dealer-subscription-terms" />
      <LegalDocument filename="dealer-subscription-terms.md" />
    </>
  );
}
