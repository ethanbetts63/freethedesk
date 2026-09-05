import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Dealer Subscription Terms",
  description: "Terms for Free the Desk dealer licensing and contract subscriptions.",
};

export default function DealerSubscriptionTermsPage() {
  return <LegalDocument filename="dealer-subscription-terms.md" />;
}
