import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/LegalDocument";
import { PageSchema } from "@/components/PageSchema";
import { pageMetadata } from "@/lib/seo";

const TITLE = "Dealer Subscription Terms";
const DESCRIPTION = "Terms for Free the Desk dealer licensing and contract subscriptions.";
const PATH = "/legal/dealer-subscription-terms";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function DealerSubscriptionTermsPage() {
  return (
    <>
      <PageSchema title={TITLE} description={DESCRIPTION} path={PATH} />
      <LegalDocument filename="dealer-subscription-terms.md" />
    </>
  );
}
